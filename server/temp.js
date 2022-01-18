
const express = require('express');
const cors = require('cors');
const graphql = require('graphql');
const { GraphQLSchema, GraphQLObjectType, GraphQLInt, GraphQLString, GraphQLList } = graphql
const { graphqlHTTP } = require('express-graphql');

const { MongoClient } = require('mongodb');
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
        _id: { type: GraphQLString }
    })
})

const teamType = new GraphQLObjectType({
    name: 'Team',
    fields: () => ({
        _id: { type: GraphQLString },
        name: { type: GraphQLString },
        teamPhoto: { type: GraphQLString },
        playerslist: { type: new GraphQLList(idType) }
    })
})



const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        getAllTeams: {
            type: new GraphQLList(teamType),
            args: {id:{type:GraphQLInt}},
            resolve(parent, args) {
                async function getData() {
                    try {
                        await client.connect();
                        const database = await client.db('cricket_team');
                        const collection = await database.collection('teams');
                        const result = await collection.find({}).toArray();
                        console.log(result);
                        return ([
                            {
                                _id:'sdk',
                                name:'ksdjfk',
                                teamPhoto:'sdfksj',
                                playerslist:[{_id:'sjdfk'}]
                            }
                        ])
                    }
                    catch (error) { console.log(error); }
                    finally { await client.close(); }
                }
                getData().catch(console.dir);
            }
        }
    }
})
const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addTeam: {
            type: GraphQLString,
            args: {
                teamName: { type: GraphQLString },
                teamPhoto:{type:GraphQLString}
            },
            resolve(parent, args) {

                async function addTeamToDB() {
                    try {
                        await client.connect();
                        const database = await client.db('cricket_team');
                        const collection = await database.collection('teams');

                        const result = await collection.insertOne({ name: args.teamName,teamPhoto:args.teamPhoto,playerslist:[]});

                        console.log(result);

                        return ('result')
                        //response.send(result);
                    }
                    catch (error) {
                        console.log(error);
                    }
                    finally {
                        await client.close();
                    }

                }
                addTeamToDB().catch(console.dir);

            }
        }
    }
})

const schema = new GraphQLSchema({ query: RootQuery, mutation: Mutation });

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


server.listen(3000, () => {
    console.log("server is listing at 3000 port");
})

