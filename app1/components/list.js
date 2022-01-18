import { useNavigation } from "@react-navigation/native";
import React, { useState, useContext } from "react";
import { Text, View, Image } from "react-native";


export function List(props) {
    const Navigation = useNavigation();

    const Clicked = () => {
        Navigation.navigate(props.navigateTo, { text: props.name, id: props.id,photo:props.photo });
    }

    return (
        <>
            <View style={{ margin: 10, marginLeft: 20, marginRight: 20, padding: 10, borderWidth: 1, borderRadius: 4, boxShadow: 10 }} >
                <View style={{ flexDirection: 'row', margin: 5,marginRight:0 }}>
                    <View style={{ margin: 3 }}>
                        {/* <Text >Hello from List {props.title}</Text> */}
                        <Image style={{width:30,height:30}} source={{uri:props.photo}} />
                    </View>
                    <View style={{ margin: 3, marginLeft:20 }}>
                        <Text style={{ fontSize: 22 }} onPress={() => { Clicked() }} >{props.name}</Text>
                    </View>
                    <View style={{ margin: 3,marginRight:0, marginLeft:18, flex:1,justifyContent:'flex-end' }}>
                        <Text style={{ fontSize: 20,backgroundColor:'red',padding:4,borderRadius:4,color:'white', alignSelf:'flex-end' }} onPress={() =>  props.delete(props.id,props.name) } >Delete</Text>
                    </View>
                </View>
            </View>
        </>
    )
}