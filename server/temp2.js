
const express = require('express');
const cors = require('cors');
const graphql = require('graphql');
const { GraphQLSchema, GraphQLObjectType, GraphQLInt, GraphQLString, GraphQLList,GraphQLID } = graphql
const { graphqlHTTP } = require('express-graphql');

const { MongoClient } = require('mongodb');
const url = "mongodb://localhost:27017/";

//     const client=new MongoClient(url);



const server = express();
server.use(express.json());
server.use(cors());


let teamData=[
    {
        id: 'dsjfsk',
        name: 'skdfjlk',
        playerslist: [
            {
                id: 'sjfkls',
                name:'sdjfklds'
            },
            {
                id: 'sjfkslsa',
                name:'jsdkfjsdlkf'
            }
        ]
    },
    {
        id: 'skllskf',
        name: 'sjfksdewre',
        playerslist: [
            {
                id: 'sjfkls',
                name:'jsdkfjsdlkf'
            },
            {
                id: 'sjfkslsa',
                name:'jsdkfjsdlkf'
            }
        ]
    }
]


const playerType=new GraphQLObjectType({
    name:'Player',
    fields:()=>({
        id: {type:GraphQLID},
        name:{type:GraphQLString},
       // player_photo:{type:GraphQLString},
        about:{type:GraphQLString}
    })
})

const idType = new GraphQLObjectType({
    name: 'id',
    fields: () => ({
        id: { type: GraphQLID }
    })
})

const teamType = new GraphQLObjectType({
    name: 'Team',
    fields: () => ({
        id: { type: GraphQLString },
        name: { type: GraphQLString },
        // team_photo:{type:GraphQLString},
        playerslist: { type: new GraphQLList(idType) }
    })
})



const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        getAllTeams: {
            type: new GraphQLList(teamType),
            args: {},
            resolve(parent, args) {
                return teamData
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
            resolve(parent, args) {
                teamData.push({id:teamData.length+1,name:args.name,playerslist:[]});
                return args
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

