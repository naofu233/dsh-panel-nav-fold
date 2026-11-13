window.__ModuleLoader__.load({
  id: 'dsh-panel-nav-fold',
  factory() {
    const NS = 'panel-nav-fold';
    const STORAGE_KEY = 'dsh.panel-nav-fold.folded';
    const COLLAPSED_ATTR = 'data-dsh-panels-folded';

    const zh = {
      label: '面板导航栏',
      expand: '展开面板导航栏',
      collapse: '收起面板导航栏',
    };
    const en = {
      label: 'Panel Navigation',
      expand: 'Expand panel navigation',
      collapse: 'Collapse panel navigation',
    };

    const ICON_DOWN = [
      '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"',
      ' stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">',
      '<path d="M6 9l6 6 6-6"/></svg>',
    ].join('');
    const ICON_UP = [
      '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"',
      ' stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">',
      '<path d="M6 15l6-6 6 6"/></svg>',
    ].join('');

    /*
     * Layout contract of the current shell (dsh-client-ui-sidebar SidebarRoot):
     *
     *   div.root (flex column)
     *     div.logoRow
     *     button.newSession
     *     button[data-dsh-part="sidebar-entry"]  (injected by other plugins)
     *     div.scrollRegion
     *       div.scrollArea (CSS grid: 4px | 1fr | 6px)
     *         nav.panelList (grid-row 2, grid-column 2)
     *         div.regionArea (workspaces, grid-row 4, grid-column 2)
     *     div.footArea
     *
     * The panel rows are NOT the only member of the panel navigation group:
     * plugins insert their own entry buttons as direct children of `root`,
     * between New Session and scrollRegion. The toggle therefore belongs in
     * `root` as well, right before the first entry — mounting it inside the
     * scrollArea (as an earlier build did) lets CSS grid auto-placement drop
     * it into the 4px leading gutter, which renders it as a narrow icon that
     * overlaps the first panel rows.
     */
    const CSS = [
      '.dshpf-nav{display:flex;align-items:center;gap:6px;width:100%;min-height:32px;',
      'margin:0 0 2px;padding:5px 12px;border:none;border-radius:var(--dsw-radius-md);',
      'background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;',
      'font:inherit;font-size:13px;font-weight:600;line-height:22px;text-align:left;',
      'box-sizing:border-box;flex:none;user-select:none}',
      '.dshpf-nav:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}',
      '.dshpf-nav:focus-visible{outline:2px solid var(--dsw-alias-label-primary);outline-offset:-2px}',
      '.dshpf-nav-icon{display:inline-flex;flex:none;margin-left:auto;opacity:.8}',
      '.dshpf-nav-label{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      /* Whole sidebar collapsed to the 56px rail: icon-only control, like the native rail rows. */
      '[class*="_root"][class*="_collapsed"] .dshpf-nav{width:36px;min-height:36px;padding:0;',
      'margin:0 auto 2px;justify-content:center}',
      '[class*="_root"][class*="_collapsed"] .dshpf-nav-icon{margin-left:0}',
      '[class*="_root"][class*="_collapsed"] .dshpf-nav-label{display:none}',
      'html[' + COLLAPSED_ATTR + '="1"] nav[aria-label="全局面板"],',
      'html[' + COLLAPSED_ATTR + '="1"] nav[aria-label="Global panels"],',
      'html[' + COLLAPSED_ATTR + '="1"] [class*="_panelList"],',
      'html[' + COLLAPSED_ATTR + '="1"] [data-dsh-part="sidebar-entry"]{display:none!important}',
      /*
       * Tighten the gap between the panel navigation group and the workspace
       * section. The shell reserves an 8px top grid row, an 8px bottom margin
       * on the panel list and a 2px grid row below it; with this plugin's own
       * full-width header those read as an extra empty row. Collapse them so
       * the workspace section follows the group directly (its own section
       * header still keeps its inner 8px padding).
       */
      '[class*="_root"] [class*="_panelList"]{margin-bottom:0}',
      '[class*="_root"] [class*="_scrollArea"]{grid-template-rows:8px max-content 0px max-content}',
      'html[' + COLLAPSED_ATTR + '="1"] [class*="_scrollRegion"]{margin-top:0}',
      'html[' + COLLAPSED_ATTR + '="1"] [class*="_scrollArea"]{grid-template-rows:0px 0px 0px max-content}',
    ].join('');

    function readFolded() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw === null ? true : raw === '1';
      } catch {
        return true;
      }
    }

    function applyFolded(folded) {
      try {
        document.documentElement.setAttribute(COLLAPSED_ATTR, folded ? '1' : '0');
      } catch {
        /* the document may not be ready during an early module load */
      }
    }

    function persistFolded(folded) {
      try {
        localStorage.setItem(STORAGE_KEY, folded ? '1' : '0');
      } catch {
        /* private mode without storage: the toggle still works per session */
      }
      applyFolded(folded);
    }

    /** The native global-panel nav. Labels are localized, so fall back to the shell's module class. */
    function findPanelNav() {
      return (
        document.querySelector('nav[aria-label="全局面板"], nav[aria-label="Global panels"]') ??
        document.querySelector('[class*="_panelList"]')
      );
    }

    /**
     * Resolve the sidebar shell root that owns both the panel nav and the
     * plugin sidebar entries.
     * @returns the root and the scroll region, or null while the shell is not mounted.
     */
    function findShell() {
      const nav = findPanelNav();
      if (nav === null) return null;
      const scrollRegion = nav.parentElement?.parentElement ?? null;
      const root = scrollRegion?.parentElement ?? null;
      if (root === null || !root.contains(nav)) return null;
      return { root, scrollRegion };
    }

    /**
     * The first plugin sidebar entry direct child of the shell root, else the
     * scroll region. The toggle is inserted before it.
     */
    function findAnchor(root, scrollRegion) {
      for (const child of root.children) {
        if (child.getAttribute('data-dsh-part') === 'sidebar-entry') return child;
      }
      return scrollRegion;
    }

    function mountToggle(ctx) {
      const t = ctx.locale.bind(NS);
      let folded = readFolded();

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'dshpf-nav';
      button.dataset.dshpf = 'panel-nav-toggle';
      button.innerHTML =
        '<span class="dshpf-nav-label"></span>' +
        '<span class="dshpf-nav-icon">' + ICON_DOWN + '</span>';

      const icon = button.querySelector('.dshpf-nav-icon');
      const label = button.querySelector('.dshpf-nav-label');

      const render = () => {
        const action = folded ? t('expand') : t('collapse');
        button.setAttribute('aria-label', action);
        button.setAttribute('aria-expanded', folded ? 'false' : 'true');
        button.setAttribute('title', action);
        label.textContent = t('label');
        icon.innerHTML = folded ? ICON_DOWN : ICON_UP;
        applyFolded(folded);
      };

      button.addEventListener('click', () => {
        folded = !folded;
        persistFolded(folded);
        render();
      });

      render();

      let disposed = false;
      const ensure = () => {
        if (disposed) return;
        const shell = findShell();
        if (shell === null) return;
        const anchor = findAnchor(shell.root, shell.scrollRegion);
        if (button.parentElement !== shell.root || button.nextElementSibling !== anchor) {
          shell.root.insertBefore(button, anchor);
        }
      };

      ensure();
      let scheduled = false;
      const observer = new MutationObserver(() => {
        if (disposed || scheduled) return;
        scheduled = true;
        requestAnimationFrame(() => {
          scheduled = false;
          ensure();
        });
      });
      observer.observe(document.body, { childList: true, subtree: true });
      const unsubscribeLocale = ctx.locale.subscribe(() => render());

      return () => {
        disposed = true;
        unsubscribeLocale();
        observer.disconnect();
        button.remove();
      };
    }

    return {
      inject: ['locale'],
      apply(ctx) {
        applyFolded(readFolded());

        ctx.effect(() => {
          const style = document.createElement('style');
          style.dataset.plugin = 'dsh-panel-nav-fold';
          style.dataset.pluginCss = 'dsh-panel-nav-fold';
          style.textContent = CSS;
          document.head.appendChild(style);
          return () => {
            style.remove();
            document.documentElement.removeAttribute(COLLAPSED_ATTR);
          };
        }, 'panel-nav-fold: styles');

        ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'panel-nav-fold: dictionaries');

        ctx.effect(() => mountToggle(ctx), 'panel-nav-fold: toggle');
      },
    };
  },
});
