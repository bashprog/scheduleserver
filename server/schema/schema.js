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
import { Plane } from '../models/Plane';

const UserType = new GraphQLObjectType({
    name: "User",
    fields: () => ({
        _id: {type: GraphQLID},
        email: {type: GraphQLString},
        name: {type: GraphQLString},
        password: {type: GraphQLString},
        token: {type: GraphQLString},
        role: {type: GraphQLString},
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
        plane_id: {type: GraphQLString},
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
        },
        plane: {
            type: PlaneType,
            resolve(parent, args){
                return Plane.findOne({_id: parent.plane_id})
            }
        }
    })
})

const PlaneType = new GraphQLObjectType({
    name: "Plane",
    fields: () => ({
        _id: {type: GraphQLID},
        name: {type: GraphQLString},
    })
})

const CommentType = new GraphQLObjectType({
    name: "Comment",
    fields: () => ({
        _id: {type: GraphQLID},
        comment: {type: GraphQLString},
        fly_id: {type: GraphQLString},
        author_id: {type: GraphQLString},
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
        updateUser: {
            type: UserType,
            args: {_id: {type: GraphQLString}, name: {type: GraphQLString},email: {type: GraphQLString}, password: {type: GraphQLString}},
            resolve(parent, args){
                return User.findOneAndUpdate(
                    {_id: args._id},
                    {name: args.name, email: args.email, password: args.password},
                    {new: true} //{filter}{update}{new: true} - последний параметр если в ответе нужен обновленный вариант данных
                )
            }
        },
        addUser: {
            type: UserType,
            args: {name: {type: GraphQLString},email: {type: GraphQLString}, password: {type: GraphQLString}},
            async resolve(parent, args){
                const user = new User({
                    name: args.name,
                    email: args.email,
                    password: args.password,
                    role: "manager",
                    token: "",
                })

                return await user.save();
            }
        },
        deleteUserById: {
            type: UserType,
            args: {_id: {type: GraphQLString}},
            async resolve(parent, args){
                User.findOneAndDelete({_id: args._id}, (err) => {return err})
            }
        },
        addFly: {
            type: FlyType,
            args: {author_id: {type: GraphQLString}, date: {type: GraphQLDateTime}, duration: {type: GraphQLInt}, plane_id: {type: GraphQLString}},
            async resolve(parent, args){
                const fly = new Fly({
                    author_id: args.author_id,
                    date: new Date(args.date),
                    duration: args.duration,
                    plane_id: args.plane_id
                });

                return await fly.save();
            }
        },
        changeFly: {
            type: FlyType,
            args: {fly_id: {type: GraphQLString}, date: {type: GraphQLDateTime}, duration: {type: GraphQLInt}, plane_id: {type: GraphQLString}},
            async resolve(parent, args){
                return Fly.findOneAndUpdate(
                    {_id: args.fly_id},
                    {
                        date: args.date,
                        duration: args.duration,
                        plane_id: args.plane_id 
                    },
                    {new: true}
                )
            }
        },
        deleteFly: {
            type: FlyType,
            args: {fly_id: {type: GraphQLString}},
            async resolve(parent, args){
                Fly.findOneAndDelete({_id: args.fly_id}, (err) => {return err})
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
        },
        deleteComment: {
            type: CommentType,
            args: {comment_id: {type: GraphQLString}},
            async resolve(parent, args){
                Comment.findOneAndDelete({_id: args.comment_id}, (err) => {return err})
            }
        },
        addPlane: {
            type: PlaneType,
            args: {name: {type: GraphQLString}},
            async resolve(parent, args){
                const plane = new Plane({
                    name: args.name
                })
                return await plane.save();
            }
        },
        deletePlane: {
            type: PlaneType,
            args: {_id: {type: GraphQLString}},
            async resolve(parent, args){
                Plane.findOneAndDelete({_id: args._id}, (err) => {return err});
            }
        }
    }
})

const Query = new GraphQLObjectType({
    name: "Query",
    fields: {
        loginByToken: {
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
        getFlyById: {
            type: FlyType,
            args: {_id: {type: GraphQLString}},
            resolve(parent, args){
                return Fly.findOne({_id: args._id})
            }
        },
        getAllFlys: {
            type: GraphQLList(FlyType),
            resolve(){
                return Fly.find({})
            }
        },
        getDailyFlys: {
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
        getWeeklyFlys: {
            type: GraphQLList(FlyType),
            args: {date: {type: GraphQLDateTime}},
            resolve(parent, args){
                let today = new Date(args.date);
                let pastWeek = new Date(today).setDate(today.getDate() + 7);
                return Fly.find({
                    date: {$gte: new Date(today), $lte: new Date(pastWeek)}
                })
            }
        },
        getFlysByDate: {
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
        },
        getAllPlanes: {
            type: GraphQLList(PlaneType),
            resolve(){
                return Plane.find({})
            }
        }
    }
})

module.exports = new GraphQLSchema({
    query: Query,
    mutation: Mutation
})