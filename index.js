// npm i apollo-server graphql

import {ApolloServer, UserInputError,  gql} from 'apollo-server';
import { v4 as uuidv4 } from "uuid";
import axios from 'axios';


const typeDefinitions = gql`

enum hasPhoneNumber {
  YES
  NO
}

type Address {
    street: String
    city: String
}

  type Person {
    id: ID!
    name: String!
    phone: String
    address: Address!
    addressSentence: String!
    check: String!
  }

  type Query {
    personCount: Int!
    allPersons(hasPhone: hasPhoneNumber): [Person]!
    allNamesCapitalCase: [String]!
    findPerson(name: String!): Person
  }

  type Mutation {
    addPerson(
      name: String!
      phone: String
      street: String!
      city: String!
    ): Person
    # 
    editNumber(
      id: String!
      phone: String!
    ): Person
  }
`;

const resolvers = {
  Query: {
    personCount: () => persons.length,
  allPersons: async (root, args) => {

  return await axios.get("http://localhost:3000/persons")
  .then(({data}) => {
   if (!args.hasPhone) return data;

    const byPhone = (person) => {
      return args.hasPhone === "YES" ? person.phone : !person.phone;
    };

    return data.filter(byPhone);
  })
  .catch((error) => {
    console.error(error);
  });
},
    allNamesCapitalCase: async () => {
      const arr = [];
      const {data} = await axios.get("http://localhost:3000/persons");

      data.map((person) => {
        arr.push(person.name.toLowerCase());
      });
      return arr;
    },
    findPerson: async (root, args) => {
      const { name } = args;
      const persons = await axios.get("http://localhost:3000/persons");

      const person = persons.data.find(p => p.name === name)
      return person;
    },
  },

  Mutation: {
    addPerson: async  (_, args) => {

     const person = await axios.post("http://localhost:3000/persons", {
        ...args,
        id: uuidv4()
      })

     return person.data
    },
    // addPerson( _, args) {
    //   if (persons.find((person) => person.phone === args.phone)) {
    //     throw new UserInputError("Phone must be unique", {
    //       invalidArgs: args.phone,
    //     });
    //   }
    //   const person = { ...args, id: uuidv4() };
    //   persons.push(person);
    //   return person;
    // },
    editNumber: ( _, args) => {
      const personIndex = persons.findIndex(person => person.id === args.id)
      if (personIndex === -1) return null;

      const person = persons[personIndex];

      const updatePerson = {...person, phone: args.phone}
      persons[personIndex] = updatePerson;
      return updatePerson
    }
  },

  Person: {
    address: (root) => {
      return {
        street: root.street,
        city: root.city,
      };
    },
    addressSentence: (root) =>
      `My name is ${root.name}, I live in ${root.street}, ${root.city}`,
    check: () => "Good morning!",
  },
};


const server = new ApolloServer({
  typeDefs: typeDefinitions,
  resolvers,
});

server.listen({port: 5000}).then(({url}) => {
    console.log("Server ready at " + url);
});

