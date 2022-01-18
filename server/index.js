
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



const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        teams: {
            type: new GraphQLList(teamType),
            args: {},
            async resolve(parent, args) {
                async function getData() {
                    try {
                        await client.connect();
                        const database = await client.db('cricket_team');
                        const collection = await database.collection('teams');
                        const result = await collection.find({}).toArray();
                        return result;
                    }
                    catch (error) { console.log(error); }
                    finally { await client.close(); }
                }
                let data = await getData().catch(console.dir);
                return data;
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
                async function addTeamToDB() {
                    try {
                        await client.connect();
                        const database = await client.db('cricket_team');
                        const collection = await database.collection('teams');
                        const result = await collection.insertOne({ name: args.name, playerslist: [] });
                        return result;
                    }
                    catch (error) {
                        console.log(error);
                    }
                    finally {
                        await client.close();
                    }
                }
                let data = await addTeamToDB().catch(console.dir);
                return ({ _id: data.insertedId,name:args.name,playerslist:[] })
            }
        },
        addPlayer: {
            type: idType,
            args: {
                team_id: { type: GraphQLString}, 
                name: { type: GraphQLString },
                about: { type: GraphQLString }
            },
            async resolve(parent, args) {
                async function addPlayerToDB() {
                    try {
                        await client.connect();
                        const database = await client.db('cricket_team');
                        const collection = await database.collection('players');
                        const result = await collection.insertOne({ name: args.name, about: args.about });
                        let id = result.insertedId;

                        const collection1 = await database.collection('teams');
                        const result1 = await collection1.updateMany({ _id: ObjectId(args.team_id) }, { $push: { playerslist: { _id: id, name: args.name } } })
                        // result=await collection.find({_id:ObjectId('61deb22b98e8939c0e19c9ab')}).toArray();
                        return id;
                    }
                    catch (error) {
                        console.log(error);
                    }
                    finally {
                        await client.close();
                    }
                }
                let data = await addPlayerToDB().catch(console.dir);
                return ({ _id: data , name:'' })
            }
        },
        deleteTeam: {
            type: idType,
            args: {
                teamId: { type: GraphQLString }
            },
            async resolve(parent, args) {
                async function deleteTeam(){
                try {
                    await client.connect();
                    const database = await client.db('cricket_team')
                    let collection = await database.collection('teams');
                    const result = await collection.findOne({ _id: ObjectId(args.teamId) });
                    const colletion1 = await database.collection('players');
                    const id=result._id;
                   result.playerslist.map(async (player) =>  {
                        const result1 = await colletion1.deleteOne({ _id: player._id });
                    })
                    collection = await database.collection('teams');
                    const result2 = await collection.deleteOne({ _id: ObjectId(args.teamId) })
                    return id;
                }
                catch (error) {
                    console.error(error);
                }
                finally{
                    client.close();
                }
            }
            let data=await deleteTeam().catch(console.dir)
            return ({_id:args.teamId,name:''});
            }
        },
        deletePlayer:{
            type:idType,
            args:{
                teamId:{type:GraphQLString},
                playerId:{type:GraphQLString},
            },
            async resolve(parent,args){
                async function deletePlayer(){
                    try{
                        await client.connect();
                        const database=await client.db('cricket_team');
                        const collection=await database.collection('teams');
                        const result=await collection.updateOne({_id:ObjectId(args.teamId)},{$pull:{playerslist:{_id:ObjectId(args.playerId)}}});
                        
                        const colletion1=await database.collection('players');
                        const result1=await colletion1.deleteOne({_id:ObjectId(args.playerId)});
                        console.log(result1);
                        return {_id:args.teamId}
                    }
                    catch(error){
                        console.error(error)
                    }
                    finally{
                        client.close();
                    }
                }
                let data=await deletePlayer().catch(console.dir)
                return data;
            }
        }
    }
})

const schema = new    GraphQLSchema({ query: RootQuery, mutation: Mutation });

server.use('/graphql', graphqlHTTP({
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

