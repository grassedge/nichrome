/// <reference path="../../d.ts/DefinitelyTyped/jqueryui/jqueryui.d.ts" />
/// <reference path="../Util.ts" />
/// <reference path="../service/Board.ts" />

declare var JST:any;

module Nicr.Controller {

    export class ThreadList {
        private $el: JQuery;
        private model: Model.Board;
        private threads: IndexedList<Model.Thread>;
        private sortKey: string;
        private sortOrder: number;

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

            this.boardService.on('fetch:' + this.model.id(), (e) => { this.onFetch(e); });
            this.boardService.on('fetch:start:' + this.model.id(), (e) => { this.onFetchStart(e); });
            this.boardService.on('close:board:' + this.model.id(), (e) => { this.onClose(e); });

            this.$el.on('click', '.thread-list-item', (e) => { this.onClickThreadListItem(e) });
            this.$el.on('submit', '.thread-list-filter', (e) => { this.onSubmitFilter(e) });
            this.$el.on('click', '.thread-list-header', (e) => { this.onClickThreadListHeader(e) });
        }

        private render() {
            var html = JST['thread-list']({threads:this.threads});
            this.$el.find('.thread-list').html(html);
        }

        private onFetch(event) {
            var threads = event;
            var key = this.sortKey;
            var sign = this.sortOrder;
            if (this.sortKey && this.sortOrder) {
                threads.sort((a,b) => (+a[key] > +b[key] ? -1 : 1) * sign);
            }
            this.threads = new IndexedList(threads);
            this.render();
            this.$el.find('.thread-list').removeClass('translucence');
        }

        private onFetchStart(event) {
            this.$el.find('.thread-list').addClass('translucence');
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

        private onSubmitFilter(event) {
            event.preventDefault();
            var query = $(event.target).find('input').val();
            this.$el.find('.thread-list-item').hide();
            this.$el.find('.thread-list-item:contains(' + query + ')').show();
        }

        private onClickThreadListHeader(event) {
            var $header = $(event.target);
            var key = $header.attr('data-sort-key');
            if (!key) return;
            var sign = (this.sortKey !== key) ? 1 : this.sortOrder * -1;
            this.threads = this.threads.sort((a,b) => (+a[key] > +b[key] ? -1 : 1) * sign);
            this.sortOrder = sign;
            this.sortKey = key;
            this.render();
        }
    }
}


