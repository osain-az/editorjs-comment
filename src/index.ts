
import { API,  ToolConfig } from "@editorjs/editorjs/types"; // to support typescript, you have install this while developing 

enum CommentId {
  CommentBlockId = "commentBlockId",
  BlockId = "blockid",
  ContainerId = "comment-container-id",
}

enum CommentClasses {
  Active = "comment-show-active",
}

export interface CommentBlockData {
  id: string;
  count: number;
}

/**
 *  a unique id used to identify section of of comments
 *
 * @type {string|null}
 */
export interface RenderBody {
  /**
   *  a unique id used to identify section of of comments
   *
   * @type {string|null}
   */
  commentBlockId: string | null;
  blockId: string | null;
  onClose: () => void;
  addCommentBlockData: (data: CommentBlockData) => void;
  removeBlockComments: () => void;
}

export interface CommentConfig {
  markerColor?: string;
  activeColor?: string;
  editorjsId?: string;
  renderBody: ({
    commentBlockId,
    blockId,
    addCommentBlockData,
    onClose,
    removeBlockComments,
  }: RenderBody) => HTMLElement | any //JSX.Element;
}

/**
 *Comment Tool for Editor.js
 *
 * Allows to add comment to section of marked area.
 * 
 * ```Typescript
 *  comment: {
    class: Comment,
    inlineToolbar: true,

    config: {
    
      renderBody: ({
        commentBlockId,
        blockId,
        onClose,
        addCommentBlockData,
      }: {
        commentBlockId: string;
        blockId: string;
        onClose: () => void;
        addCommentBlockData: (data: any) => void;
      }) => {
        return RenderItem({
          onClose,
          blockId,
          commentId: commentBlockId,
          setCommentBlockData: addCommentBlockData,
        });
      },
    },
  },
  * ```
 */
export default class Comment {
  /**
   *  a unique id used to identify section of of comments
   *
   * @type {string|null}
   */
  commentBlockId: string | null = null;

  /**
   * Class name for term-tag
   *
   * @type {string}
   */
  static get CSS() {
    return "cdx-comment";
  }

  /**
   * Color use to override the existing maker background color
   *
   * if added in the config , it will override the existing css color
   *
   * @type {string}
   */
  markerColor?: string;

  /**
   * Color use to override the existing  color for identifying which current  comment is open
   *
   * if added in the config , it will override the existing css color
   *
   * @type {string}
   */
  activeColor?: string;

  // private commentId: string | null = null;

  private get blockId() {
    const index = this.api.blocks.getCurrentBlockIndex();
    const block = this.api.blocks.getBlockByIndex(index);
    if (!block) {
      console.error("can nto find the current  block id");
      return block;
    }
    return block.id;
  }

  editorJsId: string = "editorjs";

  iconClasses: {
    base: string;
    active: string;
  };

  /**
   *  Editor.js API
   * @type {API}
   */
  public api: API;

  /**
   * Toolbar Button
   *
   * @type {HTMLElement|null}
   */
  public button: HTMLElement | null = null;

  /**
   * Renders the body of the comment tool.
   *
   * @param {RenderBody} params - Parameters for rendering the body
   * @param {string | null} params.commentBlockId - The comment block ID
   * @param {string | null} params.blockId - The block ID
   * @param {() => void} params.onClose - Function to close the comment
   * @param {(data: CommentBlockData) => void} params.addCommentBlockData - Function to add comment block data
   * @returns {HTMLElement  | JSX.Element} - The rendered body element
   */

  public renderBody: ({
    commentBlockId,
    blockId,
    onClose,
    addCommentBlockData,
  }: RenderBody) => HTMLElement | null | any //JSX.Element;  // any should have been JSX.Element

  /**
   * Class name for term-tag
   *
   * @type {string}
   */

  public tag: string = "MARK";

  range: Range | null = null;

  constructor({
    api,
    config,
  }: {
    api: API;
    config?: ToolConfig<CommentConfig>;
  }) {
    this.api = api;
    // this.data = data;
    this.renderBody = () => null;
    this.markerColor = config?.markerColor;
    this.activeColor = config?.activeColor;
    this.commentBlockId = null;
    if (config?.editorjsId) {
      this.editorJsId = config.editorjsId;
    }
    //  html or JSX.Element is required
    if (!config || config.renderBody === null) {
      console.log("No render component was added in the config");
    }

    if (config && config.renderBody !== null) {
      this.renderBody = config.renderBody;
    }

    this.activeOnClick();
    /**
     * CSS classes
     */
    this.iconClasses = {
      base: this.api.styles.inlineToolButton,
      active: this.api.styles.inlineToolButtonActive,
    };
  }

  /**
   * Specifies Tool as Inline Toolbar Tool
   *
   * @return {boolean}
   */
  static get isInline() {
    return true;
  }

  /**
   * Create button element for Toolbar
   *
   * @return {HTMLElement}
   */
  render() {
    this.button = document.createElement("button");
    this.button.classList.add(this.iconClasses.base);
    this.button.innerHTML = `<?xml version="1.0" ?><svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M20 2H4c-1.103 0-2 .897-2 2v18l4-4h14c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zm-3 9h-4v4h-2v-4H7V9h4V5h2v4h4v2z"/></svg>`;

    const Container = document.createElement("div");

    Container.appendChild(this.button);

    this.button.addEventListener("click", () => {
      this.renderCommentComponent();
    });

    return Container;
  }

  onClose() {
    console.log("close comment section");
    this.hideCommentComponent();
  }

  renderActions() {
    // render a placeholder div  for the comment  component
    this.hideCommentComponent();
    const commentContainer = document.createElement("div");
    commentContainer.hidden = true;
    //commentContainer.id = CommentId.commentDisplayContainer;
    return commentContainer;
  }

  /**
   * Wrap/Unwrap selected fragment
   *
   * @param {Range} range - selected fragment
   */
  surround(range: Range) {
    if (!range) {
      return;
    }

    //let termWrapper = this.api.selection.findParentTag(this.tag, Comment.CSS);

    this.range = range;
  }

  customSurround() {
    let termWrapper = this.api.selection.findParentTag(this.tag, Comment.CSS);
    /**
     * If start or end of selection is in the highlighted block
     */

    if (termWrapper) {
      this.unwrap(termWrapper);
    } else {
      if (this.range) this.wrap(this.range);
    }
  }
  /**
   * Wrap selection with term-tag
   *
   * @param {Range} range - selected fragment
   */
  wrap(range: Range) {
    /**
     * Create a wrapper for highlighting
     */
    let marker = document.createElement(this.tag);
    marker.setAttribute(
      CommentId.CommentBlockId,
      this.commentBlockId as string
    );
    marker.setAttribute(CommentId.BlockId, this.blockId as string);
    marker.classList.add(Comment.CSS);

    marker.onclick = () => {
      this.hideCommentComponent();
      this.setCommentBlockId(marker);
      this.renderCommentComponent();
    };

    /**
     * SurroundContent throws an error if the Range splits a non-Text node with only one of its boundary points
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Range/surroundContents}
     *
     * // range.surroundContents(span);
     */
    marker.appendChild(range.extractContents());
    marker.classList.add(Comment.CSS);

    range.insertNode(marker);

    /**
     * Expand (add) selection to highlighted block
     */
    this.api.selection.expandToTag(marker);
  }

  /**
   * Unwrap term-tag
   *
   * @param {HTMLElement} termWrapper - term wrapper tag
   */
  unwrap(termWrapper: HTMLElement) {
    /**
     * Expand selection to all term-tag
     */
    this.api.selection.expandToTag(termWrapper);

    let sel = window.getSelection();
    if (!sel) {
      return;
    }

    let range = sel.getRangeAt(0);

    let unwrappedContent = range.extractContents();

    if (!termWrapper.parentNode) {
      return;
    }
    termWrapper.parentNode.removeChild(termWrapper);

    /**
     * Insert extracted content
     */
    range.insertNode(unwrappedContent);

    /**
     * Restore selection
     */
    sel.removeAllRanges();
    sel.addRange(range);
  }

  addCommentBlockData(data: CommentBlockData) {
    // this means all comments has been deleted  so remove the commentBlockId on the div
    if (data.count < 1 && this.commentBlockId) {
      this.commentBlockId = null;
    }
    if (data.count > 0 && !this.commentBlockId) {
      this.commentBlockId = data.id;

      //  this.setCommentBlockId();
      this.customSurround();
    }
  }

  removeBlockComments() {
    //Todo: implement unrwapping method base on the commentblockId
    console.log("remove comments");
  }

  setCommentBlockId(element: HTMLElement) {
    const commentBlockId = element.getAttribute(CommentId.CommentBlockId);
    if (!commentBlockId) {
      this.commentBlockId = null;
      return;
    }

    this.commentBlockId = commentBlockId;

    // }
  }

  activeOnClick() {
    const holder = document.getElementById(this.editorJsId);

    const observer = new MutationObserver((mutationList) => {
      mutationList.forEach((mutation, y) => {
        const targetNode: HTMLElement = mutation.target as HTMLElement;

        if (
          mutation.type === "childList" &&
          targetNode.classList.contains("codex-editor__redactor")
        ) {
          const spanTooltips = document.querySelectorAll(`.${Comment.CSS}`);

          spanTooltips.forEach((marker) => {
            const markerElement = marker as HTMLElement;
            if (this.markerColor) {
              markerElement.style.backgroundColor = this.markerColor;
            }
            markerElement.onclick = () => {
              this.setCommentBlockId(markerElement);

              this.renderCommentComponent();
            };
          });
        }
      });
    });

    if (holder) {
      observer.observe(holder, { childList: true, subtree: true });
    }
  }

  hideCommentComponent() {
    const commentContainer = document.getElementById(CommentId.ContainerId);
    this.removeActiveClass();
    if (!commentContainer) return;

    commentContainer.remove();
  }

  renderCommentComponent() {
    this.hideCommentComponent();

    const commentComponent = document.createElement("div");
    //
    const blockId1 = this.api.blocks.getBlockByIndex(0)?.id;
    const container = document.querySelector(`div[data-id=${blockId1}]`);
    if (!container) {
      console.log("No div found on the first index");
      return;
    }
    commentComponent.id = CommentId.ContainerId;

    container.appendChild(commentComponent);
    const blockId = this.blockId;
    if (!blockId) {
      return;
    }

    const response = this.renderBody({
      commentBlockId: this.commentBlockId,
      blockId,
      onClose: () => this.onClose(),
      addCommentBlockData: (data: CommentBlockData) =>
        this.addCommentBlockData(data),
      removeBlockComments: () => this.removeBlockComments(),
    });

    if (response === null) {
      console.log("No render component was added in the config");
      return;
    }

    if (response instanceof HTMLElement) {
      commentComponent.appendChild(
        this.renderBody({
          commentBlockId: this.commentBlockId,
          onClose: () => this.onClose(),
          blockId,
          addCommentBlockData: (data: CommentBlockData) =>
            this.addCommentBlockData(data),
          removeBlockComments: () => this.removeBlockComments(),
        }) as Node
      );
    } else {

        // To avoid typescript error when using for project that uses html  instead of  react  we set to any 
      import("react-dom/client"  as any).then(({ createRoot }) => {
        const root = createRoot(commentComponent);

        root.render(response);
      }).catch(err =>{})
    }
    this.setActiveClass();
  }

  setActiveClass() {
    if (!this.commentBlockId) return;
    const element = this.elementByAttribute(
      CommentId.CommentBlockId,
      this.commentBlockId
    );
    if (!element) return;
    element.classList.add(CommentClasses.Active);
    if (this.activeColor) {
      element.style.borderColor = this.activeColor;
    }
  }

  removeActiveClass() {
    const elements = document.querySelectorAll("." + CommentClasses.Active);

    elements.forEach((element) => {
      element.classList.remove(CommentClasses.Active);
    });
  }

  elementByAttribute(attributeName: string, value: string): HTMLElement {
    return document.querySelector(
      `[${attributeName}="${value}"]`
    ) as HTMLElement;
  }

  /*   getSelectedDiv() {
    const selectedRange = window.getSelection()?.getRangeAt(0);
    const selectedDiv = selectedRange?.commonAncestorContainer.parentElement;
    if (!selectedDiv) return null;

    return selectedDiv;
  } */
  /**
   * Check and change Term's state for current selection
   */
  checkState() {
    const termTag = this.api.selection.findParentTag(this.tag, Comment.CSS);

    if (!this.button) {
      return;
    }

    this.button.classList.toggle(this.iconClasses.active, !!termTag);
  }

  /**
   * Get Tool icon's SVG
   * @return {string}
   */
  get toolboxIcon() {
    return "";
  }

  /**
   * Sanitizer rule
   * @return {{mark: {class: string}}}
   */
  static get sanitize() {
    return {
      mark: true,
    };
  }
}

export {Comment}
