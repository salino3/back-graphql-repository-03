// npm i apollo-server graphql

import {ApolloServer, UserInputError,  gql} from 'apollo-server';
import { v4 as uuidv4 } from "uuid";

const persons = [
  {
    id: "3durj545736njf773-334ghh-34-vdg6p",
    name: "Joe",
    phone: "037993-282633227",
    street: "c/ San Miguel",
    city: "Barcelona",
  },
  {
    id: "3durj544456njf773-334ghh-34-vdg6p",
    name: "Daniel",
    phone: "037902-282633227",
    street: "c/ San Rafael",
    city: "Madrid",
  },
  {
    id: "3durj444736njf773-777ghh-34-vdg6p",
    name: "Gigi",
    street: "c/ San Nicola",
    city: "Bilbao",
  },
];

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
    allPersons: (root, args) => {
      if (!args.hasPhone) return persons;

      const byPhone = person => {
       return args.hasPhone === "YES" ? person.phone : !person.phone;
      }
      return persons.filter(byPhone)
    },
    allNamesCapitalCase: () => {
      const arr = [];

      persons.map((person) => {
        arr.push(person.name.toLowerCase());
      });
      return arr;
    },
    findPerson: (root, args) => {
      const { name } = args;
      return persons.find((person) => person.name === name);
    },
  },

  Mutation: {
    addPerson( _, args) {
      if (persons.find((person) => person.phone === args.phone)) {
        throw new UserInputError("Phone must be unique", {
          invalidArgs: args.phone,
        });
      }
      const person = { ...args, id: uuidv4() };
      persons.push(person);
      return person;
    },
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

