/// <reference path="../service/Thread.ts" />

module Nicr.Controller {

    export class Thread {

        private $el: JQuery;

        private tabModels: IndexedList<Model.Thread>;
        private activeThread: Model.Thread;
        private recentlyClosed: Model.Thread[] = [];

        private threadService: Service.Thread;
        private commentService: Service.Comment;
        private menuService: Service.Menu;

        private recentMax: number = 10;

        constructor(args:{
            $el:JQuery;
            threadService:Service.Thread;
            commentService:Service.Comment;
            menuService:Service.Menu;
        }) {
            this.$el = args.$el;
            this.threadService  = args.threadService;
            this.commentService = args.commentService;
            this.menuService = args.menuService;

            this.tabModels = new IndexedList();

            this.threadService.on('add:thread', (e) => { this.onAddThread(e) });
            this.threadService.on('select:thread', (e) => { this.onSelectThread(e) });
            this.threadService.on('close:thread', (e) => { this.onCloseThread(e) });
            this.threadService.on('open:recent', (e) => { this.onOpenRecent(e) });
            this.threadService.on('close:expired', (e) => { this.onCloseExpired(e) });
            this.commentService.on('fetch', (e) => { this.onFetchThread(e) });

            this.$el.on('click', '.trash-button', (e) => { this.onClickTrashButton(e) });
            this.$el.on('click', '.reload-thread-button', (e) => { this.onClickReloadThreadButton(e) });
            this.$el.on('click', '.thread-menu-button', (e) => { this.onClickThreadMenuButton(e) });

            this.$el.find('.thread-tab').sortable();
            this.$el.on('sortstop', (e, ui) => { this.onSortStop(e, ui) });
        }

        setup() {
            // take before openThread() because of override.
            var activeKey = this.threadService.retrieveActiveTabFromStorage();

            var tab = this.threadService.retrieveTabFromStorage();
            this.threadService.retrieveByKeysFromIDB(tab).done((storedList) => {
                var threads = new IndexedList(storedList);

                tab.forEach((thread) => {
                    var stored = threads.get(thread.id());
                    this.threadService.openThread(stored || thread);
                });

                var thread = this.tabModels.get(activeKey);
                if (thread) this.threadService.selectThread(thread);
            });

            var menuHtml = JST['thread-popup-menu']();
            this.$el.prepend(menuHtml);
            new Controller.ThreadMenu({
                $el: this.$el.find('.thread-menu'),
                threadService: this.threadService
            });
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
                $tabItem:this.$el.find('#thread-tab-' + thread.id()),
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

        private onAddThread(event) {
            var thread = event.thread;
            this.addThread(thread);
            this.commentService.fetchWithCache(thread);
        }

        private onSelectThread(event) {
            var thread = event.thread;
            this.selectThread(thread);
        }

        private onCloseThread(event) {
            var thread = event.thread;
            var reselect = thread.equals(this.activeThread);
            var idx = this.deleteThread(thread);
            if (reselect) this.selectThreadByIndex(idx);
            this.recentlyClosed.push(thread);
            if (this.recentlyClosed.length > this.recentMax) this.recentlyClosed.shift();
        }

        private onFetchThread(event) {
            this.setThreadTitle(this.activeThread);
        }

        private onOpenRecent(event) {
            var thread = this.recentlyClosed.pop();
            if (!thread) return;
            this.threadService.openThread(thread);
        }

        private onCloseExpired(event) {
            var expired = this.tabModels.getList().filter((thread) => !thread.active);
            expired.forEach((thread) => {
                this.threadService.closeThread(thread);
            });
        }

        private onClickTrashButton(event) {
            this.threadService.closeThread(this.activeThread);
        }

        private onClickReloadThreadButton(event) {
            this.commentService.fetchWithCache(this.activeThread, {force:true});
        }

        private onClickThreadMenuButton(event) {
            this.$el.find('.thread-menu').show();
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
    }

}