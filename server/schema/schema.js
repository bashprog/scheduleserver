import { GraphQLObjectType, GraphQLString, GraphQLSchema, GraphQLID, GraphQLList, GraphQLScalarType, GraphQLInt } from 'graphql';
import {
    GraphQLDate,
    GraphQLTime,
    GraphQLDateTime
  } from 'graphql-iso-date';

import { User } from '../models/User';
import { Fly } from '../models/Fly';
import { Comment } from '../models/Comment';

import { generate_token } from "../tokenGenerator";

const UserType = new GraphQLObjectType({
    name: "User",
    fields: () => ({
        _id: {type: GraphQLID},
        email: {type: GraphQLString},
        name: {type: GraphQLString},
        password: {type: GraphQLString},
        token: {type: GraphQLString},
        flys: {
            type: GraphQLList(FlyType),
            resolve(parent, args){
                return Fly.find({author_id: parent._id})
            }
        }
    })

})

const FlyType = new GraphQLObjectType({
    name: "Fly",
    fields: () => ({
        _id: {type: GraphQLID},
        date: {type: GraphQLString},
        duration: {type: GraphQLInt},
        author_id: {type: GraphQLString},
        author: {
            type: UserType,
            resolve(parent, args){
                return User.findOne({_id: parent.author_id})
            }
        },
        comments: {
            type: GraphQLList(CommentType),
            resolve(parent, args){
                return Comment.find({fly_id: parent._id})
            }
        }
    })
})

const CommentType = new GraphQLObjectType({
    name: "Comment",
    fields: () => ({
        _id: {type: GraphQLID},
        comment: {type: GraphQLString},
        author: {
            type: UserType,
            resolve(parent, args){
                return User.findOne({_id: parent.author_id})
            }
        }
    })
})

const Mutation = new GraphQLObjectType({
    name: "Mutation",
    fields: {
        login: {
            type: UserType,
            args: {email: {type: GraphQLString}, password: {type: GraphQLString}},
            resolve(parent, args){
                return User.findOneAndUpdate(
                    {email: args.email, password: args.password},
                    {token: `${generate_token(32)}`},
                    {new: true} //{filter}{update}{new: true} - последний параметр если в ответе нужен обновленный вариант данных
                )
            }
        },
        addFly: {
            type: FlyType,
            args: {author_id: {type: GraphQLString}, date: {type: GraphQLDateTime}, duration: {type: GraphQLInt}},
            async resolve(parent, args){
                const fly = new Fly({
                    author_id: args.author_id,
                    date: new Date(args.date),
                    duration: args.duration
                });
                return await fly.save();
            }
        },
        deleteFly: {
            type: FlyType,
            args: {author_id: {type: GraphQLString}, fly_id: {type: GraphQLString}},
            async resolve(parent, args){
                Fly.findOneAndDelete({author_id: args.author_id, _id: args.fly_id}, (err) => {return err})
            }
        },
        addComment: {
            type: CommentType,
            args: {comment: {type: GraphQLString}, fly_id: {type: GraphQLString}, author_id: {type: GraphQLString}},
            async resolve(parent, args){
                const comment = new Comment({
                    comment: args.comment,
                    author_id: args.author_id,
                    fly_id: args.fly_id
                })
                return await comment.save();
            }
        }
    }
})

const Query = new GraphQLObjectType({
    name: "Query",
    fields: {
        getUserByToken: {
            type: UserType,
            args: {token: {type: GraphQLString}},
            resolve(parent, args){
                return User.findOne({token: args.token})
            }

        },
        getUserById: {
            type: UserType,
            args: {_id: {type: GraphQLString}},
            resolve(parent, args){
                return User.findOne({_id: args._id})
            }
        },
        getAllUsers: {
            type: GraphQLList(UserType),
            resolve(){
                return User.find({})
            }
        },
        getAllFlys: {
            type: GraphQLList(FlyType),
            resolve(){
                return Fly.find({})
            }
        },
        getFlyByDay: {
            type: GraphQLList(FlyType),
            args: {date: {type: GraphQLDateTime}},
            resolve(parent, args){
                let today = new Date(args.date);
                let tommorow = new Date(today).setDate(today.getDate() + 1);

                return Fly.find({
                    date: {$gte: new Date(today), $lte: new Date(tommorow)}
                })
            }
        },
        getFlyByDate: {
            type: GraphQLList(FlyType),
            args: {from: {type: GraphQLDateTime}, to: {type: GraphQLDateTime}},
            resolve(parent, args){
                let from = new Date(args.from);
                let to = new Date(args.to);
                return Fly.find({
                    date: {$gte: new Date(from), $lte: new Date(to)}
                })
            }
        },
        getComments: {
            type: GraphQLList(FlyType),
            resolve(){
                return Comment.find({})
            }
        }
    }
})

module.exports = new GraphQLSchema({
    query: Query,
    mutation: Mutation
})