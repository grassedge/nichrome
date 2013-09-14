/// <reference path="../../d.ts/DefinitelyTyped/jqueryui/jqueryui.d.ts" />
/// <reference path="../Util.ts" />
/// <reference path="../service/Board.ts" />

declare var JST:any;

module Nicr.Controller {

    export class ThreadList {
        private $el: JQuery;
        private model: Model.Board;
        private threads: IndexedList<Model.Thread>;

        private boardService: Service.Board;
        private threadService: Service.Thread;

        constructor(args:{
            $el:JQuery;
            model:Model.Board;
            boardService:Service.Board;
            threadService:Service.Thread;
        }) {
            this.$el = args.$el;
            this.model = args.model;
            this.boardService = args.boardService;
            this.threadService = args.threadService;

            this.boardService.on('fetch:' + this.model.boardKey, (e) => { this.onFetch(e); });
            this.boardService.on('close:board:' + this.model.boardKey, (e) => { this.onClose(e); });

            this.$el.on('click', '.thread-list-item', (e) => { this.onClickThreadListItem(e) });
        }

        private render() {
            var html = JST['thread-list']({threads:this.threads});
            this.$el.find('.thread-list').html(html);
        }

        private onFetch(event) {
            this.threads = new IndexedList(event);
            this.render();
        }

        private onClose(event) {
            this.boardService.off('fetch:' + this.model.boardKey);
            this.boardService.off('close:board:' + this.model.boardKey);
            this.$el.remove();
        }

        private onClickThreadListItem(event) {
            var $threadListItem = $(event.currentTarget);
            var threadKey = $threadListItem.attr('data-thread-key');
            var key = this.model.boardKey + '-' + threadKey;
            this.threadService.openThread(this.threads.get(key));
        }
    }
}


