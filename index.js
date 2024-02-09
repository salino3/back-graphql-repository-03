// npm i apollo-server graphql

import {ApolloServer, gql} from 'apollo-server';

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
    allPersons: [Person]!
    allNamesCapitalCase: [String]!
    findPerson(name: String!): Person
  }
`;

const resolvers = {
  Query: {
    personCount: () => persons.length,
    allPersons: () => persons,
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
  Person: {
    address: (root) => {
      return {
        street: root.street,
        city: root.city,
      };
    },
    addressSentence: (root) => `My name is ${root.name}, I live in ${root.street}, ${root.city}`,
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

