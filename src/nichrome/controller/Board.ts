/// <reference path="../service/Board.ts" />

declare var JST:any;

module Nicr.Controller {

    export class Board {
        $el: JQuery;
        model: any;
        boardService: Service.Board;

        constructor(args:{
            $el:JQuery;
            boardService:Service.Board;
        }) {
            this.$el = args.$el;
            this.boardService = args.boardService;

            this.boardService.on('fetch', (event) => {
                this.model = event;
                this.render(event);
            });
        }

        render(event) {
            console.log(event[0].title);
            // var html = JST['category']({bbsData:bbsData});
            this.$el.find('.board-content').html(event[0].title);
        }
    }
}
