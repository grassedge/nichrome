/// <reference path="../service/BBS.ts" />
/// <reference path="../service/Board.ts" />

declare var JST:any;

module Nicr.Controller {

    export class BBS {
        $el: JQuery;
        model: any;
        bbsService: Service.BBS;
        boardService: Service.Board;

        constructor(args:{
            $el:JQuery;
            bbsService:Service.BBS;
            boardService:Service.Board;
        }) {
            this.$el = args.$el;
            this.bbsService = args.bbsService;
            this.boardService = args.boardService;

            this.bbsService.on('fetch', (event) => {
                this.model = event.bbsData;
                this.render(event.bbsData);
            });
            this.$el.on('click', '.category-name', (e) => this.onClickCategoryName(e));
            this.$el.on('click', '.board-list-item', (e) => this.onClickBoardListItem(e));
        }

        render(bbsData) {
            var html = JST['category']({bbsData:bbsData});
            this.$el.find('.bbs-content').html(html);
        }

        onClickCategoryName(event) {
            var $categoryListItem = $(event.currentTarget).closest('.category-list-item');
            $categoryListItem.toggleClass('selected');
            $categoryListItem.find('.board-list').toggle();
        }

        onClickBoardListItem(event) {
            var $boardListItem = $(event.currentTarget);
            $boardListItem.toggleClass('selected');
            this.boardService.openBoard($boardListItem.attr('data-href'));
        }
    }
}
