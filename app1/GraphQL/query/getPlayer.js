
import { gql } from "@apollo/client";

export const getPlayers=gql`
    query {
        players(team_id:"$id"){
            _id
            name
        }
    }
`