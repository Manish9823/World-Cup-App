
import { useQuery, gql, useMutation } from "@apollo/client";
import React, { useState, useEffect } from "react";
import { Text, View, ScrollView, StyleSheet, TouchableOpacity, Pressable, Modal, Image, TextInput } from "react-native";
import { url, addButton } from "../App";
import { List } from "../components/list";



const getPlayersQuery = gql`
query Player($id:String!){
    players(team_id:$id){
        _id
        name
    }
}
`;
const addPlayerQuery = gql`
mutation AddPlayer($teamId:String!,$name:String!,$about:String!){
    addPlayer(team_id:$teamId,name:$name,about:$about){
        _id
        name
    }
}
`;

const deletePlayerQuery = gql`
mutation DeletePlayer($teamId:String!,$playerId:String!){
    deletePlayer(teamId:$teamId,playerId:$playerId){
        _id
        name
    }
}
`;



export function ListPage(props) {
    let name = props.route.params.text;
    const id = props.route.params.id;

    const getPlayerRequest = useQuery(getPlayersQuery, ({ variables: { id: id } }));
    const [addPlayerRequest, addPlayerResponse] = useMutation(addPlayerQuery);
    const [deletePlayerRequest, deletePlayerResponse] = useMutation(deletePlayerQuery);


    const [playerList, setPlayerList] = useState([])
    const [modalVisible, setModalVisible] = useState(false);
    const [modalVisibleDelete, setModalVisibleDelete] = useState(false);
    const [newPlayerName, setNewPlayerName] = useState('')
    const [newPlayerAbout, setNewPlayerAbout] = useState('')
    const [teamId, setTeamId] = useState(id);
    const [deleteId, setDeleteId] = useState('');
    const [deleteName, setDeleteName] = useState('')

    useEffect(() => {
            getPlayerRequest.refetch();
    }, [deletePlayerResponse]);

    useEffect(() => {
            getPlayerRequest.refetch();
    }, [addPlayerResponse]);


    useEffect(() => {
        if (getPlayerRequest.data) {
            setPlayerList(getPlayerRequest.data.players)
        }
    }, [getPlayerRequest]);

    const photo = 'http://pluspng.com/img-png/user-png-icon-png-ico-512.png'


    const addPlayer = () => {
        addPlayerRequest({
            variables: {
                teamId: teamId,
                name: newPlayerName,
                about: newPlayerAbout
            }
        })
        setNewPlayerName('');
        setNewPlayerAbout('');
        setModalVisible(!modalVisible);
    }

    const deletePlayer = () => {
        deletePlayerRequest({
            variables: {
                teamId: teamId,
                playerId: deleteId
            }
        })
        setDeleteId('');
        setDeleteName('');
        setModalVisibleDelete(!modalVisibleDelete);
    }




    return (
        <>
            <ScrollView>
                <View style={[styles1.heading]}>
                    <View style={{ flexDirection: 'row', margin: 5 }}>
                        <View>
                            <Text style={[styles1.heading_text]}>{name}</Text>
                        </View>
                        <View style={{ margin: 3, flex: 1, justifyContent: 'center' }}>
                            <TouchableOpacity onPress={() => setModalVisible(true)}>
                                <Image style={{ width: 30, height: 30, alignSelf: 'flex-end' }} source={{ uri: addButton }} />

                            </TouchableOpacity>

                        </View>
                    </View>

                </View>


                {
                    playerList.map((player, index) => (
                        <List key={index} name={player.name} id={player._id} photo={photo} navigateTo='profile' delete={(id, name) => { setDeleteId(id), setDeleteName(name); setModalVisibleDelete(true); }} />
                    ))
                }


                <View style={styles.centeredView}>
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={modalVisible}
                        onRequestClose={() => {
                            Alert.alert("Modal has been closed.");
                            setModalVisible(!modalVisible);
                        }}
                    >
                        <View style={styles.centeredView}>
                            <View style={styles.modalView}>
                                <Text style={[styles.modalText, { fontSize: 30, fontWeight: 'bold' }]}>Add Player</Text>
                                <Text style={{ alignSelf: 'flex-start', fontSize: 20, marginTop: 5, color: 'black' }}>Player Name :-</Text>
                                <TextInput value={newPlayerName} style={{ alignSelf: 'center', fontSize: 20, marginTop: 10, marginBottom: 50, borderRadius: 5, width: 200, borderBottomWidth: 2, borderColor: "#aaa" }} placeholder="eg. Rohit Sharma" onChangeText={(e) => setNewPlayerName(e)} />

                                <Text style={{ alignSelf: 'flex-start', fontSize: 20, marginTop: 5, color: 'black' }}>About Player :-</Text>
                                <TextInput value={newPlayerAbout} style={{ alignSelf: 'center', fontSize: 20, marginTop: 10, marginBottom: 50, borderRadius: 5, width: 200, borderWidth: 2, borderColor: "#aaa" }} placeholder=" " onChangeText={(e) => setNewPlayerAbout(e)} />

                                {
                                    <View style={{ flexDirection: "row" }}>
                                        <Pressable
                                            style={[styles.button]}
                                            onPress={() => { setNewPlayerName(''); setNewPlayerAbout(''); setModalVisible(!modalVisible) }}
                                        >
                                            <Text style={[styles.textStyle, { color: 'black' }]}>Cancel</Text>
                                        </Pressable>
                                        <Pressable
                                            style={[styles.button, styles.buttonClose]}
                                            onPress={() => addPlayer()}
                                        >
                                            <Text style={styles.textStyle}>ADD</Text>
                                        </Pressable>
                                    </View>
                                }
                            </View>
                        </View>
                    </Modal>
                </View>



                <View style={[styles.centeredView]}>
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={modalVisibleDelete}
                        onRequestClose={() => {
                            Alert.alert("Modal has been closed.");
                            setModalVisible(!modalVisibleDelete);
                        }}
                    >
                        <View style={styles.centeredView}>
                            <View style={styles.modalView}>
                                <Text style={[styles.modalText, { fontSize: 30, fontWeight: 'bold' }]}>Delete Player</Text>
                                <Text style={{ alignSelf: 'flex-start', fontSize: 20, marginTop: 5, color: 'black' }}>Do you Really want to Delete {deleteName} Player</Text>
                                {
                                    <View style={{ flexDirection: "row", marginTop: 30 }}>

                                        <Pressable
                                            style={[styles.button]}
                                            onPress={() => { setDeleteId(''); setDeleteName(''); setModalVisibleDelete(!modalVisibleDelete); }}
                                        >
                                            <Text style={[styles.textStyle, { color: 'black' }]}>Cancel</Text>
                                        </Pressable>

                                        <Pressable
                                            style={[styles.button, styles.buttonClose, { color: 'white', backgroundColor: 'red' }]}
                                            onPress={() => deletePlayer()}
                                        >
                                            <Text style={[styles.textStyle]}>Delete</Text>
                                        </Pressable>


                                    </View>
                                }

                            </View>
                        </View>
                    </Modal>

                </View>



            </ScrollView>
        </>
    )
}


const styles1 = StyleSheet.create({
    heading: {
        margin: 5,
        padding: 5,
        flex: 1,
        justifyContent: 'center'
    },
    heading_text: {
        fontSize: 25,
        color: '#444',
        fontWeight: 'bold',
        fontFamily: 'roboto'
    }
})



const styles = StyleSheet.create({

    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 15,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        marginTop: 70,

    },
    button: {
        borderRadius: 20,
        elevation: 2,
        padding: 10,
        width: 100,
        margin: 5
    },
    buttonOpen: {
        backgroundColor: "#F194FF",
    },
    buttonClose: {
        backgroundColor: "#2196F3",
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center"
    }
});