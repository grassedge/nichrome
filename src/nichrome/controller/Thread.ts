/// <reference path="../service/Thread.ts" />

module Nicr.Controller {

    export class Thread {

        private $el: JQuery;

        private tabModels: IndexedList<Model.Thread>;
        private activeThread: Model.Thread;

        private threadService: Service.Thread;
        private commentService: Service.Comment;

        constructor(args:{
            $el:JQuery;
            threadService:Service.Thread;
            commentService:Service.Comment;
        }) {
            this.$el = args.$el;
            this.threadService  = args.threadService;
            this.commentService = args.commentService;
            this.tabModels = new IndexedList();

            this.threadService.on('open:thread', (e) => { this.onOpenThread(e) });
            this.threadService.on('close:thread', (e) => { this.onCloseThread(e) });
            this.commentService.on('fetch', (e) => { this.onFetchThread(e) });

            this.$el.on('click', '.trash-button', (e) => { this.onClickTrashButton(e) });
            this.$el.on('click', '.reload-thread-button', (e) => { this.onClickReloadThreadButton(e) });
            this.$el.on('click', '.thread-tab-item', (e) => { this.onClickThreadTabItem(e) });
            this.$el.on('click', '.close-button', (e) => { this.onClickCloseButton(e) });
            this.$el.find('.thread-tab').sortable();
            this.$el.on('sortstop', (e, ui) => { this.onSortStop(e, ui) });
        }

        setup() {
            // take before openThread() because of override.
            var activeKey = this.threadService.retrieveActiveTabFromStorage();

            var tab = this.threadService.retrieveTabFromStorage();
            tab.forEach((thread) => {
                this.threadService.openThread(thread);
            });

            var thread = this.tabModels.get(activeKey);
            if (thread) this.selectThread(thread);
        }

        private addThread(thread:Model.Thread) {
            if (this.tabModels.get(thread.id())) return;
            this.tabModels.push(thread);
            var tabItemHtml = JST['thread-tab-item']({thread:thread});
            var threadHtml = JST['thread']({thread:thread});
            this.$el.find('.thread-tab').append(tabItemHtml);
            this.$el.find('.thread-content').append(threadHtml);
            new CommentList({
                $el:this.$el.find('#thread-' + thread.id()),
                thread:thread,
                threadService:this.threadService,
                commentService:this.commentService,
            });
            this.threadService.saveTabToStorage(this.tabModels.getList());
        }

        private deleteThread(thread:Model.Thread):number {
            var having = this.tabModels.get(thread.id());
            if (!having) return;
            var idx = this.tabModels.indexOf(having);
            this.tabModels.splice(idx, 1);
            this.$el.find('#thread-tab-' + thread.id()).remove();
            this.threadService.saveTabToStorage(this.tabModels.getList());
            return idx;
        }

        private selectThread(thread:Model.Thread) {
            this.setThreadTitle(thread);

            var originalThread = this.activeThread;
            if (thread.equals(originalThread)) return;
            this.activeThread = thread;
            this.$el.find('#thread-tab-' + thread.id()).addClass('selected');
            this.$el.find('#thread-' + thread.id()).show();
            this.threadService.saveActiveTabToStorage(thread.id());
            if (!originalThread) return;
            this.$el.find('#thread-tab-' + originalThread.id()).removeClass('selected');
            this.$el.find('#thread-' + originalThread.id()).hide();
        }

        private selectThreadByIndex(index:number) {
            var thread = this.tabModels.at(index)
                      || this.tabModels.at(index - 1);
            if (thread) this.selectThread(thread);
        }

        private setThreadTitle(thread:Model.Thread) {
            var html = JST['thread-header']({thread:thread});
            this.$el.find('.header-center').html(html);
        }

        private onOpenThread(event) {
            var thread = event.thread;
            this.addThread(thread);
            this.selectThread(thread);
            this.commentService.fetchWithCache(thread);
        }

        private onCloseThread(event) {
            var thread = event.thread;
            var idx = this.deleteThread(thread);
            this.selectThreadByIndex(idx);
        }

        private onFetchThread(event) {
            this.setThreadTitle(this.activeThread);
        }

        private onSortStop(event, ui) {
            var $item = ui.item;
            var key = $item.attr('id').match(/^thread-tab-(.+)$/)[1];
            var thread = this.tabModels.get(key);
            var idx = this.tabModels.indexOf(thread);
            this.tabModels.splice(idx, 1);
            this.tabModels.splice($item.index(), 0, thread);
            this.threadService.saveTabToStorage(this.tabModels.getList());
        }

        private onClickTrashButton(event) {
            this.threadService.closeThread(this.activeThread);
        }

        private onClickReloadThreadButton(event) {
            this.commentService.fetchWithCache(this.activeThread, {force:true});
        }

        private onClickThreadTabItem(event) {
            if ($(event.target).hasClass('close-button')) return;
            var $tabItem = $(event.currentTarget);
            var key = $tabItem.attr('id').match(/^thread-tab-(.+?)$/)[1];
            var thread = this.tabModels.get(key);
            this.selectThread(thread);
        }

        private onClickCloseButton(event) {
            var $tabItem = $(event.currentTarget).closest('.thread-tab-item');
            var key = $tabItem.attr('id').match(/^thread-tab-(.+?)$/)[1];
            var thread = this.tabModels.get(key);
            this.threadService.closeThread(thread);
        }
    }

}