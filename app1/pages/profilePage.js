
import { useQuery,gql } from "@apollo/client";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, Text, View } from "react-native";
import { url } from "../App";

export function ProfilePage(props) {
    let name = props.route.params.text;
    let photo = props.route.params.photo;
    let id = props.route.params.id;
    console.log(id)
    const getPlayerDetails =gql `
        {
            playerdetails(player_id:"${id}"){
                _id
                name
                about
              }  
        }
    `

    const {loading,error,data}=useQuery(getPlayerDetails);

    const [data1, setData1] = useState({ name: '', about: '' })

    useEffect(() => {
        if(data){
            setData1(data.playerdetails)
        }
    }, [data])


    return (
        <>
            <ScrollView>
                <View style={{ margin: 5, padding: 5}}>
                    <Image style={{ width: 100, height: 100, alignSelf: 'center' ,borderWidth:2,borderColor:'black',borderRadius:10}} source={{ uri: photo }} />
                </View>
                <View style={{ margin: 5, padding: 10 }}>
                    <Text style={{ alignSelf: 'center', fontSize: 40, color: 'black' }}>{data1.name}</Text>
                </View>
                <View style={{ margin: 10 }}>
                    <Text style={{ fontSize: 30, color: '#333' }}>About</Text>

                    <View style={{ margin: 5, marginTop: 20, padding: 8, color: "#000" }}>
                        <Text style={{ fontSize: 20 }}> {data1.about}</Text>
                    </View>
                </View>
            </ScrollView>
        </>
    )
}