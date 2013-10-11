/// <reference path="../../d.ts/DefinitelyTyped/jqueryui/jqueryui.d.ts" />
/// <reference path="../Util.ts" />
/// <reference path="../service/Board.ts" />

declare var JST:any;

module Nicr.Controller {

    export class ThreadListContextMenu {
        private $el: JQuery;
        private thread: Model.Thread;

        private threadService:Service.Thread;
        private commentService:Service.Comment;
        private menuService:Service.Menu;

        constructor(args:{
            menuService:Service.Menu;
            threadService:Service.Thread;
            commentService:Service.Comment;
        }) {
            this.$el = $(JST['thread-list-context-menu']());
            $('body').append(this.$el);

            this.menuService = args.menuService;
            this.threadService = args.threadService;
            this.commentService = args.commentService;

            this.menuService.on('open:contextmenu', (e) => { this.onOpen(e) });

            this.$el.on('click', '.delete-log', (e) => { this.onClickDeleteLog(e) });
            $(document).on('click', (e) => { this.onClickBody(e) });
        }

        private onOpen(event) {
            this.thread = event.thread;
            this.$el.show();
            this.$el.css({top:event.top,left:event.left});
        }

        private onClickDeleteLog(event) {
            if (!this.thread) return;
            this.threadService.deleteThreadLog(this.thread);
            this.commentService.deleteDatLog(this.thread);
        }

        private onClickBody(event) {
            this.$el.hide();
            delete this.thread;
        }
    }
}


