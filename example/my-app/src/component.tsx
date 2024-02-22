//import { signal, computed, useSignal } from "@preact/signals";
import { signal } from "@preact-signals/safe-react";
import { withTrackSignals } from "@preact-signals/safe-react/manual";
import { CommentBlockData, RenderBody } from "editorjs-comment";

interface Comment {
  commentBlockId: string;
  blockId: string;
  content: string
  //... your custom fields

}
const comments = signal<Comment[]>([]);

const commentSignal = signal<Comment>(Object());

const RenderItem = ({
  commentBlockId,
  blockId,
  onClose,
  addCommentBlockData,
}: RenderBody) => {
  commentSignal.value = {
    ...Object(),
    commentBlockId,
    blockId,
  };

  const data = (value: string) => {
    commentSignal.value = { ...commentSignal.value, content: value };
  };

  //save comment to DB
  const saveComment = () => {
    

    addContractCommentApi({
      ...commentSignal.value,
    
    }).then((respo) => {
      if (respo.length > 0) {
        const data = {
          id: respo[0].commentBlockId,
          count: respo.length,
        };

        // if the data is save to the database  then call the setCommentBlockData method 
        // for every new comment section this should be call, it will highlight the selected section with marker and also add the required data to the block.
        // this can be called only once for a new comment section
        if (addCommentBlockData) {
          addCommentBlockData(data);
        }
        comments.value = respo;
      }
    });
  };

  //The commentBlockId for the current  comment section is available  to be use to query the db, depending on your logic
  const getComments = () => {

    if (!commentBlockId) {
      comments.value = [];
      return;
    }
    getContractCommentByIdApi(commentBlockId)
      .then((respon) => {
        if (respon.length > 0) {
          addCommentBlockData({
            id: respon[0].commentBlockId,
            count: respon.length,
          });
          comments.value = respon;
        }
      })
      .catch((err) => {
        comments.value = [];
        console.log(err);
      });
  };
  getComments();

  // manually render on change
  const ShowComments = withTrackSignals(() => {
    return (
      <div>
        {comments.value.map((comment, index) => (
          <div key={index}>
             <div>{comment.}</div>
          </div>
        ))}
      </div>
    );
  });

  const closeEl = () => {
    if (!onClose) return;
    onClose();
  };

  return (
    <Paper
      style={{ zIndex: 3, position: "absolute" }}
      className="comment-popover"
      contentEditable={false}
    >
      <div style={{ textAlign: "right" }} onClick={closeEl}>
        <Btn text="Close" onClick={closeEl} />
      </div>
      <div style={{ margin: 10 }}>
        <div>{text.value}</div>
        <div>
          <InputField
            label="tesv"
            type="text"
            value={commentSignal.value.content}
            onChange={data}
          />
          <Btn text="Add comment" onClick={saveComment} />
        </div>
        <div>
          <ShowComments />
        </div>
      </div>
    </Paper>
  );
};

export default RenderItem;
