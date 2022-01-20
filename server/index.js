
const express = require('express');
const cors = require('cors');
const graphql = require('graphql');
const { GraphQLSchema, GraphQLObjectType, GraphQLInt, GraphQLString, GraphQLList, GraphQLID } = graphql
const { graphqlHTTP } = require('express-graphql');

const { MongoClient, ObjectId } = require('mongodb');
const url = "mongodb://localhost:27017/";

const client = new MongoClient(url);



const server = express();
server.use(express.json());
server.use(cors());

const playerType = new GraphQLObjectType({
    name: 'Player',
    fields: () => ({
        _id: { type: GraphQLString },
        name: { type: GraphQLString },
        // player_photo:{type:GraphQLString},
        about: { type: GraphQLString }
    })
})

const idType = new GraphQLObjectType({
    name: 'id',
    fields: () => ({
        _id: { type: GraphQLString },
        name: { type: GraphQLString }
    })
})

const teamType = new GraphQLObjectType({
    name: 'Team',
    fields: () => ({
        _id: { type: GraphQLString },
        name: { type: GraphQLString },
        // team_photo:{type:GraphQLString},
        playerslist: { type: new GraphQLList(idType) }
    })
})


const repository = {
    getAllTeams: async function () {
        try {
            await client.connect();
            const database = await client.db('cricket_team');
            const teamsCollection = await database.collection('teams');
            return await teamsCollection.find({}).toArray();
        }
        finally { await client.close(); }
    },
    addTeam: async function (name) {
        try {
            await client.connect();
            const database = await client.db('cricket_team');
            const teamsCollection = await database.collection('teams');
            return await teamsCollection.insertOne({ name: name, playerslist: [] });
        }
        finally {
            await client.close();
        }
    },

    // TODO :- Transaction
    addPlayer: async function(args){
        try {
            await client.connect();
            const database = await client.db('cricket_team');
            const teamsCollection = await database.collection('players');
            const insertedPlayer = await teamsCollection.insertOne({ name: args.name, about: args.about });
            const playersCollection = await database.collection('teams');
            await playersCollection.updateMany({ _id: ObjectId(args.team_id) }, { $push: { playerslist: { _id: insertedPlayer.insertedId, name: args.name } } })
            return insertedPlayer.insertedId;
        }
        finally {
            await client.close();
        }
    },

    // TODO :- Transaction
    deleteTeam: async function(args){
        try {
            await client.connect();
            const database = await client.db('cricket_team')
            let teamsCollection = await database.collection('teams');
            const selectedTeam = await teamsCollection.findOne({ _id: ObjectId(args.teamId) });
            const playersCollection = await database.collection('players');
            selectedTeam.playerslist.map(async (player) => {
               await playersCollection.deleteOne({ _id: player._id });
            });
            await teamsCollection.deleteOne({ _id: ObjectId(args.teamId) });
            return selectedTeam.id;
        }
        finally {
            client.close();
        }
    },

    // TODO:- Transaction
    deletePlayer:async function(args){
        try {
            await client.connect();
            const database = await client.db('cricket_team');
            const teamsCollection = await database.collection('teams');
            await teamsCollection.updateOne({ _id: ObjectId(args.teamId) }, { $pull: { playerslist: { _id: ObjectId(args.playerId) } } });
            const playersCollection = await database.collection('players');
            await playersCollection.deleteOne({ _id: ObjectId(args.playerId) });
            return { _id: args.teamId };
        }
        finally {
            client.close();
        }
    }
};

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        teams: {
            type: new GraphQLList(teamType),
            args: {},
            async resolve(parent, args) {
                try {
                    return await repository.getAllTeams();
                }
                catch (err) {
                    return err;
                }
            }
        },
        players: {
            type: new GraphQLList(playerType),
            args: {
                team_id: { type: GraphQLString }
            },
            async resolve(parent, args) {
                async function getData() {
                    try {
                        await client.connect();
                        const database = await client.db('cricket_team');
                        const collection = await database.collection('teams');
                        const result = await collection.findOne({ _id: ObjectId(args.team_id) });
                        return result;
                    }
                    catch (error) { console.log(error); }
                    finally { await client.close(); }
                }
                let data = await getData().catch(console.dir);
                return data.playerslist;
            }
        },
        playerdetails: {
            type: playerType,
            args: {
                player_id: { type: GraphQLString }
            },
            async resolve(parent, args) {
                async function getData() {
                    try {
                        await client.connect();
                        const database = await client.db('cricket_team');
                        const collection = await database.collection('players');
                        const result = await collection.findOne({ _id: ObjectId(args.player_id) });
                        return result;
                    }
                    catch (error) { console.log(error); }
                    finally { await client.close(); }
                }
                let data = await getData().catch(console.dir);
                return data;
            }
        }
    }
})
const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addTeam: {
            type: teamType,
            args: {
                name: { type: GraphQLString },
            },
            async resolve(parent, args) {
                try{
                    let data = await repository.addTeam(args.name);
                    return ({ _id: data.insertedId, name: args.name, playerslist: [] });
                }
                catch(err){
                    return(err);
                }
            }
        },
        addPlayer: {
            type: idType,
            args: {
                team_id: { type: GraphQLString },
                name: { type: GraphQLString },
                about: { type: GraphQLString }
            },
            async resolve(parent, args) {
              try{
                let data = await repository.addPlayer(args);
                return ({ _id: data, name: '' });
              }
              catch(err){
                  return (err);
              }
            }
        },
        deleteTeam: {
            type: idType,
            args: {
                teamId: { type: GraphQLString }
            },
            async resolve(parent, args) {
                try{
                     await repository.deleteTeam(args);
                    return ({ _id: args.teamId, name: '' });
                }
                catch(err){
                    return (err);
                }
            }
        },
        deletePlayer: {
            type: idType,
            args: {
                teamId: { type: GraphQLString },
                playerId: { type: GraphQLString },
            },
            async resolve(parent, args) {
                try{
                    return await repository.deletePlayer(args);
                }
                catch(err){
                    return (err)
                }
            }
        }
    }
})

const schema = new GraphQLSchema({ query: RootQuery, mutation: Mutation });

server.use('/graphql', graphqlHTTP({     // here using graphql as middleware and in 
    schema,
    graphiql: true
}))








// server.get('/getData',(request,response)=>{

//     async function getData(){
//         try{
//             await client.connect();
//             const database= await client.db('cricket_team');
//             const collection=await database.collection('team');

//             const result=await collection.find({}).toArray();

//             response.send(result);
//         }
//         catch(error){
//             console.log(error);
//         }
//         finally{
//             await client.close();
//         }

//     }
//     getData().catch(console.dir);    
// })


server.listen(3333, () => {
    console.log("server is listing at 3333 port");
})

