/// <reference path="../../d.ts/DefinitelyTyped/jqueryui/jqueryui.d.ts" />
/// <reference path="../Util.ts" />
/// <reference path="../service/Board.ts" />
/// <reference path="./ThreadList.ts" />

declare var JST:any;

module Nicr.Controller {

    export class BoardMenu {
        private $el: JQuery;

        private boardService: Service.Board;
        private threadService: Service.Thread;

        constructor(args:{
            $el:JQuery;
            boardService:Service.Board;
            threadService:Service.Thread;
        }) {
            this.$el = args.$el;
            this.boardService = args.boardService;
            this.threadService = args.threadService;

            this.$el.on('click', '.all-log-list', (e) => { this.onClickAllLogList(e) });
            $(document).on('click', (e) => { this.onClickBody(e) });
        }

        onClickAllLogList(event) {
            this.boardService.openBoard(new Model.Board({boardKey:'log', title:'log'}));
        }

        onClickBody(event) {
            var $target = $(event.target);
            if ($target.hasClass('menu-button')) return;
            this.$el.hide();
        }
    }

}
