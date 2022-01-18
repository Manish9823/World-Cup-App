import React, { useState, useContext, useEffect } from "react";
import { ScrollView, StyleSheet, Text, View, Image, TouchableOpacity, Modal, Pressable, TextInput } from "react-native";
import { useQuery, gql, useMutation } from "@apollo/client";
import { List } from "../components/list";
import { url, addButton } from "../App";

const getTeamsQuery = gql`
    query{
        teams{
            _id
            name
        }
    }
`

const addTeamQuery = gql`
    mutation AddTeam($name:String!) {
        addTeam(name:$name){
            _id
            name
            playerslist {
                 _id
                 name
            }
        }
    }
`
const deleteTeamQuery = gql`
    mutation DeleteTeam($teamId:String!){
        deleteTeam(teamId:$teamId){
            _id
            name
        }
    }
`


export function HomePage(props) {


    const getTeamsRequest = useQuery(getTeamsQuery);


    const [addTeamRequest, addTeamResponse] = useMutation(addTeamQuery);

    const [deleteTeamRequest, deleteTeamResponse] = useMutation(deleteTeamQuery);




    const [teamList, setTeamList] = useState([]);
    const [newTeamName, setNewTeamName] = useState('')
    const [modalVisible, setModalVisible] = useState(false);
    const [deleteTeamName, setDeleteTeamName] = useState('');
    const [deleteTeamId, setDeleteTeamId] = useState('');
    const [modalVisibleDelete, setModalVisibleDelete] = useState(false);


    useEffect(() => {
            getTeamsRequest.refetch();
    }, [addTeamResponse])

    useEffect(() => {
            getTeamsRequest.refetch();
    }, [deleteTeamResponse])


    useEffect(() => {
        if (getTeamsRequest.data) {
            setTeamList(getTeamsRequest.data.teams)
        }
    }, [getTeamsRequest])



    const addTeam = () => {
        setModalVisible(!modalVisible)
        addTeamRequest({
            variables: { name: newTeamName }
        })
        setNewTeamName('');
    }

    const deleteTeam = () => {
        setModalVisibleDelete(!modalVisibleDelete);
        deleteTeamRequest({
            variables: { teamId: deleteTeamId }
        })
        setDeleteTeamId('')
    }

    const photo = 'https://pluspng.com/img-png/flag-logo-png-big-image-png-2400.png'

    return (
        <>
            <ScrollView>
                <View style={[styles1.heading]}>
                    <View style={{ flexDirection: 'row', margin: 5 }}>
                        <View>
                            <Text style={[styles1.heading_text]}>Teams List </Text>
                        </View>
                        <View style={{ margin: 3, flex: 1, justifyContent: 'center' }}>
                            <TouchableOpacity onPress={() => setModalVisible(true)}>
                                <Image style={{ width: 30, height: 30, alignSelf: 'flex-end' }} source={{ uri: addButton }} />

                            </TouchableOpacity>

                        </View>
                    </View>

                </View>



                {teamList &&
                    teamList.map((team, index) => (
                        <List key={index} name={team.name} id={team._id} photo={photo} data={team} navigateTo='list' delete={(id, name) => { setDeleteTeamId(id), setDeleteTeamName(name); setModalVisibleDelete(true); }} />
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
                                <Text style={[styles.modalText, { fontSize: 30, fontWeight: 'bold' }]}>Add Team</Text>
                                <Text style={{ alignSelf: 'flex-start', fontSize: 20, marginTop: 5, color: 'black' }}>Team Name :-</Text>
                                <TextInput value={newTeamName} style={{ alignSelf: 'center', fontSize: 20, marginTop: 10, marginBottom: 50, borderRadius: 5, width: 200, borderBottomWidth: 2, borderColor: "#aaa" }} placeholder="eg. India" onChangeText={(e) => setNewTeamName(e)} />

                                {
                                    <View style={{ flexDirection: "row" }}>

                                        <Pressable
                                            style={[styles.button]}
                                            onPress={() => { setNewTeamName(''); setModalVisible(!modalVisible); }}
                                        >
                                            <Text style={[styles.textStyle, { color: 'black' }]}>Cancel</Text>
                                        </Pressable>

                                        <Pressable
                                            style={[styles.button, styles.buttonClose]}
                                            onPress={() => addTeam()}
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
                                <Text style={[styles.modalText, { fontSize: 30, fontWeight: 'bold' }]}>Delete Team</Text>
                                <Text style={{ alignSelf: 'flex-start', fontSize: 20, marginTop: 5, color: 'black' }}>Do you Really want to Delete {deleteTeamName} Team</Text>
                                {
                                    <View style={{ flexDirection: "row", marginTop: 30 }}>

                                        <Pressable
                                            style={[styles.button]}
                                            onPress={() => { setDeleteTeamId(''); setDeleteTeamName(''); setModalVisibleDelete(!modalVisibleDelete); }}
                                        >
                                            <Text style={[styles.textStyle, { color: 'black' }]}>Cancel</Text>
                                        </Pressable>

                                        <Pressable
                                            style={[styles.button, styles.buttonClose, { color: 'white', backgroundColor: 'red' }]}
                                            onPress={() => deleteTeam()}
                                        >
                                            <Text style={[styles.textStyle]}>Delete</Text>
                                        </Pressable>


                                    </View>
                                }

                            </View>
                        </View>
                    </Modal>

                </View>





            </ScrollView >
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