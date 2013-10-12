/// <reference path="../../d.ts/DefinitelyTyped/jqueryui/jqueryui.d.ts" />
/// <reference path="../Util.ts" />
/// <reference path="../service/Board.ts" />

declare var JST:any;

module Nicr.Controller {

    export class ThreadList {
        private $el: JQuery;
        private $tabItem: JQuery;
        private board: Model.Board;
        private threads: IndexedList<Model.Thread>;
        private sortKey: string;
        private sortOrder: number;

        private boardService: Service.Board;
        private threadService: Service.Thread;
        private commentService: Service.Comment;

        private menuService: Service.Menu;

        constructor(args:{
            $el:JQuery;
            $tabItem:JQuery;
            board:Model.Board;
            boardService:Service.Board;
            threadService:Service.Thread;
            commentService:Service.Comment;
            menuService:Service.Menu;
        }) {
            this.$el = args.$el;
            this.$tabItem = args.$tabItem;
            this.board = args.board;
            this.boardService = args.boardService;
            this.threadService = args.threadService;
            this.commentService = args.commentService;
            this.menuService = args.menuService;

            this.threadService.on('fetch:' + this.board.id(), (e) => { this.onFetch(e); });
            this.threadService.on('fetch:start:' + this.board.id(), (e) => { this.onFetchStart(e); });
            this.threadService.on('delete:log', (e) => { this.onDeleteLog(e); });
            this.boardService.on('close:board:' + this.board.id(), (e) => { this.onClose(e); });
            this.commentService.on('fetch', (e) => { this.onFetchThread(e) });

            this.$el.on('click', '.thread-list-item', (e) => { this.onClickThreadListItem(e) });
            this.$el.on('submit', '.thread-list-filter', (e) => { this.onSubmitFilter(e) });
            this.$el.on('click', '.thread-list-header', (e) => { this.onClickThreadListHeader(e) });
            this.$el.on('contextmenu', '.thread-list-item', (e) => { this.onContextMenu(e) });
            this.$tabItem.on('click', (e) => { this.onClickBoardTabItem(e) });
            this.$tabItem.on('click', '.close-button', (e) => { this.onClickCloseButton(e) });
        }

        private render() {
            var html = JST['thread-list']({threads:this.threads});
            this.$el.find('.thread-list').html(html);
        }

        private onFetch(event) {
            var threads = event.threads;
            var key = this.sortKey;
            var sign = this.sortOrder;
            if (this.sortKey && this.sortOrder) {
                threads.sort((a,b) => (+a[key] > +b[key] ? -1 : 1) * sign);
            }
            var originalThreads = this.threads;
            this.threads = threads = new IndexedList(threads);
            threads.forEach((thread:Model.Thread) => {
                if (!originalThreads) return;
                var originalThread = originalThreads.get(thread.id());
                if (originalThread) {
                    thread.datSize = originalThread.datSize;
                    thread.isNew = false;
                } else {
                    thread.isNew = true;
                }
            });
            this.render();
            this.$el.find('.thread-list').removeClass('translucence');
        }

        private onFetchStart(event) {
            this.$el.find('.thread-list').addClass('translucence');
        }

        private onDeleteLog(event) {
            var thread = this.threads.get(event.thread.id());
            if (!thread) return;
            var $threadItem = this.$el.find(
                '[data-board-key="' + thread.boardKey + '"]' +
                '[data-thread-key="' + thread.threadKey + '"]'
            );
            if (thread.active) {
                $threadItem.find('.thread-log-rate').remove();
                delete thread.datSize;
            } else {
                $threadItem.remove();
            }
        }

        private onClose(event) {
            this.threadService.off('fetch:' + this.board.id());
            this.threadService.off('fetch:start:' + this.board.id());
            this.boardService.off('close:board:' + this.board.id());
            this.commentService.off('fetch');
            this.$el.remove();
            this.$tabItem.remove();
        }

        private onFetchThread(event) {
            var fetchedThread:Model.Thread = event.thread;
            // while setup, this controller has no 'threads'. so return immediately.
            if (!this.threads) return;
            // XXX refine: emit and listen event include boardKey.
            if (fetchedThread.boardKey !== this.board.boardKey) return;

            var thread = this.threads.get(fetchedThread.id());
            thread.commentCount = fetchedThread.commentCount;
            thread.datSize      = fetchedThread.datSize;
            delete thread.isNew;

            var $item = this.$el.find('[data-thread-key=' + thread.threadKey + ']');
            var selected = $item.hasClass('selected');
            var html = JST['thread-list']({threads:[thread]});
            var $newItem = $(html).toggleClass('selected', selected);
            $item.replaceWith($newItem);

            this.threadService.updateThreadDatSize(thread);
        }

        private onClickBoardTabItem(event) {
            if ($(event.target).hasClass('close-button')) return;
            this.boardService.selectBoard(this.board);
        }

        private onClickCloseButton(event) {
            this.boardService.closeBoard(this.board);
        }

        private onClickThreadListItem(event) {
            var $threadListItem = $(event.currentTarget);
            var threadKey = $threadListItem.attr('data-thread-key');
            var key = this.board.id() + '-' + threadKey;
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

        private onContextMenu(event) {
            event.preventDefault();
            var $threadListItem = $(event.currentTarget);
            var threadKey = $threadListItem.attr('data-thread-key');
            var boardKey = $threadListItem.attr('data-board-key');
            var key = boardKey + '-' + threadKey;
            // XXX check this thread has log.
            this.menuService.openContextMenu({
                thread:this.threads.get(key),
                top: event.pageY,
                left: event.pageX
            });
        }
    }
}
