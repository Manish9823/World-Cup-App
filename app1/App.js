
import React, { useState, createContext } from 'react';
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomePage } from './pages/homePage';
import { ListPage } from './pages/listPage';
import { ProfilePage } from './pages/profilePage';
import { ApolloClient, InMemoryCache, ApolloProvider,HttpLink,from } from '@apollo/client';
import {onError} from '@apollo/client/link/error';

export const url='http://192.168.43.7:3333/graphql/';
export const addButton='https://www.shareicon.net/data/2015/08/14/84917_plus_512x512.png';

const errorLink=onError(({graphqlErrors,networkError})=>{
    if(graphqlErrors){
        graphqlErrors.map((msg)=>{
            alert(`Graphql error ${msg}`);
        })
    }
});

const link=from([
    errorLink,
    new HttpLink({uri:url}),
]);

const client = new ApolloClient({
    cache: new InMemoryCache(),
    link:link
});



const Stack = createNativeStackNavigator();

export const dataContext = createContext();



const App = () => {
    return (
        <ApolloProvider client={client}>
                <NavigationContainer>
                    <Stack.Navigator screenOptions={{ headerShown: true }}>
                        <Stack.Screen name='home' component={HomePage} options={{ title: 'World Cup App' }}  />
                        <Stack.Screen name='list' component={ListPage} options={{ title: 'Player List' }} />
                        <Stack.Screen name='profile' component={ProfilePage} options={{ title: 'Profile' }} />
                    </Stack.Navigator>
                </NavigationContainer>
        </ApolloProvider>
    );
};


export default App;
