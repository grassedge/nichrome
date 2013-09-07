module Nicr.Model {

    export class Board {

        boardKey:string;
        title:string;

        constructor(args:{
            boardKey:string;
            title:string;
        }) {
            this.boardKey = args.boardKey;
            this.title    = args.title;
        }
    }
}
