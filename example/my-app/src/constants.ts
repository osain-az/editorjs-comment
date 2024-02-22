
import Comment, { RenderBody } from "editorjs-comment";



import RenderItem from "./component";


const EDITOR_JS_TOOL = {
  // attached: {
  //   class: Attached,
  //   config:{
  //     endpoint: 'http://localhost:7000/blog/uploadFile', // Your backend file uploader endpoint
  //   }
  // },

  comment: {
    class: Comment,
    inlineToolbar: true,

    config: {
      markerColor: "grey", // optional 
      activeColor: "green",// optional
      renderBody: ({
        commentBlockId,
        blockId,
        onClose,
        addCommentBlockData,
        removeBlockComments
      }: RenderBody) => {
        return RenderItem({
          onClose,
          blockId,
           commentBlockId,
           addCommentBlockData,
           removeBlockComments
        });
      },
    },
  },


  // MyTool,
  //table: Table,

  /*   inlineImage: InlineImage,
   */


/*   paragraph: {
    class: Paragraph,
    inlineToolbar: true,
    config: {
      placeholder: "Enter project description",
    },
    tunes: ["textVariant", "alignment"],
  }, */
 
  // simpleImage: SimpleImage
};
