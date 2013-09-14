/// <reference path="../Model/Board.ts" />
/// <reference path="../service/BBS.ts" />
/// <reference path="../service/Board.ts" />

declare var JST:any;

module Nicr.Controller {

    export class BBS {
        private $el: JQuery;
        private categories: any;
        private boards: IndexedList<Model.Board>;

        private configService:Service.Config;
        private bbsService: Service.BBS;
        private boardService: Service.Board;

        constructor(args:{
            $el:JQuery;
            configService:Service.Config;
            bbsService:Service.BBS;
            boardService:Service.Board;
        }) {
            this.$el = args.$el;
            this.configService = args.configService;
            this.bbsService = args.bbsService;
            this.boardService = args.boardService;

            this.bbsService.on('fetch', (e) => this.onFetch(e));
            this.$el.on('click', '.category-name', (e) => this.onClickCategoryName(e));
            this.$el.on('click', '.board-list-item', (e) => this.onClickBoardListItem(e));

            this.setup();
        }

        private setup() {
            var visibility = this.configService.getBBSContainerVisibility();
            this.$el.toggle(visibility);
        }

        private render() {
            var html = JST['category']({categories:this.categories});
            this.$el.find('.bbs-content').html(html);
        }

        private onFetch(event) {
            this.categories = event.categories;
            this.boards     = event.boards;
            this.render();
        }

        private onClickCategoryName(event) {
            var $categoryListItem = $(event.currentTarget).closest('.category-list-item');
            $categoryListItem.toggleClass('selected');
            $categoryListItem.find('.board-list').toggle();
        }

        private onClickBoardListItem(event) {
            var $boardListItem = $(event.currentTarget);
            var boardKey = $boardListItem.attr('data-board-key');
            if (boardKey) {
                $boardListItem.toggleClass('selected');
                this.boardService.openBoard(this.boards.get(boardKey));
            } else {
                window.open($boardListItem.attr('data-href'));
            }
        }
    }
}
