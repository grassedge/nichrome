/// <reference path="../../d.ts/DefinitelyTyped/jqueryui/jqueryui.d.ts" />
/// <reference path="../Util.ts" />
/// <reference path="../service/Board.ts" />
/// <reference path="./ThreadList.ts" />

declare var JST:any;

module Nicr.Controller {

    export class Board {
        private $el: JQuery;
        private tabModels: IndexedList<Model.Board>;
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
            this.tabModels = new IndexedList();

            this.boardService.on('open:board', (e) => { this.onOpenBoard(e) });
            this.boardService.on('close:board', (e) => { this.onCloseBoard(e) });

            this.$el.on('click', '.board-tab-item', (e) => { this.onClickBoardTabItem(e) });
            this.$el.on('dblclick', '.board-tab-item', (e) => { this.onDblclickBoardTabItem(e) });
            this.$el.on('click', '.toggle-bbs-button', (e) => { this.onClickToggleButton(e) });
            this.$el.on('click', '.reload-board-button', (e) => { this.onClickReloadButton(e) });
            this.$el.resizable({handles:'e'});
            this.$el.find('.board-tab').sortable();
            this.$el.on('resizestop', (e, ui) => { this.onResizeStop(e, ui) });
            this.$el.on('sortstop', (e, ui) => { this.onSortStop(e, ui) });

            this.setup();
        }

        private setup() {
            var width = this.configService.getBoardContainerWidth();
            if (width) this.$el.width(width);

            // take before openBoard() because of override.
            var activeKey = this.boardService.retrieveActiveTabFromStorage();

            var tab = this.boardService.retrieveTabFromStorage();
            tab.forEach((board) => {
                this.boardService.openBoard(board);
            });

            var board = this.tabModels.get(activeKey);
            if (board) this.selectBoard(board);
        }

        private addBoard(board:Model.Board) {
            if (this.tabModels.get(board.boardKey)) return;
            this.tabModels.push(board);
            var tabItemHtml = JST['board-tab-item']({board:board});
            var threadListHtml = JST['board']({board:board});
            this.$el.find('.board-tab').append(tabItemHtml);
            this.$el.find('.board-content').append(threadListHtml);
            new Controller.ThreadList({
                $el:this.$el.find('#thread-list-' + board.boardKey),
                model:board,
                boardService:this.boardService,
                threadService:this.threadService
            });
            this.boardService.saveTabToStorage(this.tabModels.getList());
        }

        private deleteBoard(board:Model.Board):number {
            var having = this.tabModels.get(board.boardKey);
            if (!having) return;
            var idx = this.tabModels.indexOf(having);
            this.tabModels.splice(idx, 1);
            this.$el.find('#board-tab-' + board.boardKey).remove();
            this.boardService.saveTabToStorage(this.tabModels.getList());
            return idx;
        }

        private selectBoard(board:Model.Board) {
            this.setBoardTitle(board);
            this.setThreadListSize(board);

            var prevBoard = this.activeBoard;
            if (board.equals(prevBoard)) return;
            this.activeBoard = board;
            this.$el.find('#board-tab-' + board.boardKey).addClass('selected');
            this.$el.find('#thread-list-' + board.boardKey).show();
            this.boardService.saveActiveTabToStorage(board.boardKey);
            if (!prevBoard) return;
            this.$el.find('#board-tab-' + prevBoard.boardKey).removeClass('selected');
            this.$el.find('#thread-list-' + prevBoard.boardKey).hide();
        }

        private selectBoardByIndex(index:number) {
            var board = this.tabModels.at(index)
                     || this.tabModels.at(index - 1);
            if (board) this.selectBoard(board);
        }

        private setBoardTitle(board:Model.Board) {
            var headerHtml = JST['board-header']({board:board});
            this.$el.find('.header-center').html(headerHtml);
        }

        private setThreadListSize(board:Model.Board) {
            var footerHtml = JST['board-footer']({threads:undefined});
            this.$el.find('.footer-center').html(footerHtml);
        }

        private onOpenBoard(event) {
            var board = event.board;
            this.addBoard(board);
            this.selectBoard(board);
        }

        private onCloseBoard(event) {
            var board = event.board;
            var idx = this.deleteBoard(board);
            this.selectBoardByIndex(idx);
        }

        private onResizeStop(event, ui) {
            var width = ui.size.width;
            this.configService.setBoardContainerWidth(width);
        }

        private onSortStop(event, ui) {
            var $item = ui.item;
            var boardKey = $item.attr('id').match(/^board-tab-(.+)$/)[1];
            var board = this.tabModels.get(boardKey);
            var idx = this.tabModels.indexOf(board);
            this.tabModels.splice(idx, 1);
            this.tabModels.splice($item.index(), 0, board);
            this.boardService.saveTabToStorage(this.tabModels.getList());
        }

        private onClickBoardTabItem(event) {
            var $tabItem = $(event.currentTarget);
            var boardKey = $tabItem.attr('id').match(/^board-tab-(.+)$/)[1];
            var board = this.tabModels.get(boardKey);
            this.selectBoard(board);
        }

        private onDblclickBoardTabItem(event) {
            var $tabItem = $(event.currentTarget);
            var boardKey = $tabItem.attr('id').match(/^board-tab-(.+)$/)[1];
            var board = this.tabModels.get(boardKey);
            this.boardService.closeBoard(board);
        }

        private onClickToggleButton(event) {
            var $button = $(event.currentTarget);
            $('.bbs-container').toggle();
            var visible = !!$('.bbs-container:visible').length;
            this.configService.setBBSContainerVisibility(visible);
        }

        private onClickReloadButton(event) {
            var board = this.activeBoard;
            this.boardService.fetchWithCache(board, {force:true});
        }

    }

}
