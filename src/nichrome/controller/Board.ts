/// <reference path="../../d.ts/DefinitelyTyped/jqueryui/jqueryui.d.ts" />
/// <reference path="../Util.ts" />
/// <reference path="../service/Board.ts" />
/// <reference path="./ThreadList.ts" />

declare var JST:any;

module Nicr.Controller {

    export class Board {
        private $el: JQuery;
        private activeBoard: Model.Board;

        private configService: Service.Config;
        private boardService: Service.Board;
        private threadService: Service.Thread;

        constructor(args:{
            $el:JQuery;
            configService: Service.Config;
            boardService:Service.Board;
            threadService:Service.Thread;
        }) {
            this.$el = args.$el;
            this.configService = args.configService;
            this.boardService = args.boardService;
            this.threadService = args.threadService;

            this.boardService.on('select:board', (e) => { this.onSelectBoard(e) });
            this.boardService.on('fetch', (e) => { this.onFetch(e) });

            this.$el.on('click', '.toggle-bbs-button', (e) => { this.onClickToggleButton(e) });
            this.$el.on('click', '.reload-board-button', (e) => { this.onClickReloadButton(e) });
            this.$el.resizable({handles:'e'});
            this.$el.on('resizestop', (e, ui) => { this.onResizeStop(e, ui) });

            new Controller.BoardTab({
                $el: this.$el.find('.board-content'),
                boardService: this.boardService,
                threadService: this.threadService
            });
        }

        setup() {
            var width = this.configService.getBoardContainerWidth();
            if (width) this.$el.width(width);
        }

        private setBoardTitle(board:Model.Board) {
            var headerHtml = JST['board-header']({board:board});
            this.$el.find('.header-center').html(headerHtml);
        }

        private setThreadListSize(board:Model.Board) {
            var footerHtml = JST['board-footer']({board:board});
            this.$el.find('.footer-center').html(footerHtml);
        }

        private onFetch(event) {
            var board = event.board;
            var threads = event.threads;
            this.setThreadListSize(board);
        }

        private onSelectBoard(event) {
            var board = event.board;
            this.setBoardTitle(board);
            this.setThreadListSize(board);
        }

        private onResizeStop(event, ui) {
            var width = ui.size.width;
            this.configService.setBoardContainerWidth(width);
        }

        private onClickToggleButton(event) {
            var $button = $(event.currentTarget);
            $('.bbs-container').toggle();
            var visible = !!$('.bbs-container:visible').length;
            this.configService.setBBSContainerVisibility(visible);
        }

        private onClickReloadButton(event) {
            this.boardService.reloadActiveBoard();
        }

    }

}
