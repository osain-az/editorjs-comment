# Editorjs plugin for adding comment.
<!-- markdownlint-disable first-line-h1 -->
<h1 align="center">Welcome to editorjs-comment 👋</h1>
<p>
  <a href="https://www.npmjs.com/package/editorjs-comment" target="_blank">
    <img alt="Version" src="https://img.shields.io/npm/v/editorjs-comment.svg">
  </a>
  <a href="https://github.com/osain-az/editorjs-comment/blob/master/LICENSE" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
  </a>

</p>

`editorjs-comment` plugin is design to allow developers to  create custom component  of there  comment  and pass it through config, it allows to create any comment section they want  for [editorjs](https://editorjs.io/)

<img alt="editorjscomment" src="public\editorjscomment.png" width="" /> 

### Features
* support typescript
* using  with HTML project
* using  react (JSX.Element)
* other coming soon.

#### Limitation
For React component, `Hooks` will not work since is render outside of the component,  a work around  is using preact signal https://preactjs.com/guide/v10/signals/
```typescript
 import { signal } from "@preact-signals/safe-react";
import { withTrackSignals } from "@preact-signals/safe-react/manual";
```
check the  example  for usage

## Installation

### Install via NPM

```sh
npm install editorjs-comment
```

### Load from CDN

```html
<script src="https://cdn.jsdelivr.net/npm/editorjs-comment@latest"></script>
```

## Usage

```javascript
import Comment from 'editorjs-comment';
```
ediotrjs Comment  must be used with the config. A function  that returns a JSX.Element  or HTML file must be passed to the  config file `CommentConfig`. See the config interface.


##important interfaces
```typescript
export interface RenderBody {
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
```

### Usage example

```Typescript
const EDITOR_JS_TOOL = {

  ....
  comment: {
    class: Comment,
    inlineToolbar: true,

    config: {
      markerColor: "",
      activeColor: "pink",
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
}
```

### RenderBody  function
The renderBody is a function which is a required parameter by the config. 
The function must accept the `RenderBody` interface as shown  below


```typescript
export interface RenderBody {
  commentBlockId: string | null;
  blockId: string | null;
  onClose: () => void;
  addCommentBlockData: (data: CommentBlockData) => void;
  removeBlockComments: () => void;
}
```
 #### parameter
 This parameters will be pass to the function were the developer can access then an use it. 

| Field          | Type       | required   |Description |
| --------       | -------- | -------- |  -------- |
| `commentBlockId`  | String|  true | This is a unique string(id) that represent  the  section of the highlighted  text that you want to add a comment. The developer  is responsible for creating this id the first time an comment is created. For existing comment, this value will the pass to the renderBody function where developer can use this to get the comments for this comment section |
|blockId| string |true| This is the blockId from Editorjs block  of where the comment is made. Is upto the developer if they need 
|onClose | Func| true| Function use to manually close the opened comment section |
|addCommentBlockData| Func|true |this function will initialize comment section to the corresponding BlockData to the highlighted  area  when is called, it is recommended to be called first comment of any selected area is made.
|removeBlockComments |Func| true| This function should be called with caution, it will remove the  comment section from the  editorjs  permanently. 




## config parameter is `CommentConfig`

`CommentConfig`  is the interface that is passed to the config option. only  `renderBody` is required. 

| Field          | Type       | required | default  |Description |
| --------       | -------- | -------- |  -------- | -------- |
| `markerColor`  | String|  false |    null  |The color of the  marker showing the area of the comment |
| `activeColor`  |string | false |    Add underline text decoration to the text wrapped by the tooltip. Default is `false`. |
| `editorjsId`   | String | -| editorjs| This is the container id for the editorjs, if you sed the default value `editorjs` then is not required but if you other name then is required|
| `renderBody`     | Func| true |  null |  A function that return an HTML or JSX.Element;  the function should accept the `RenderBody` interface. Check  the usage or the example |


## case study
example using react and preact/signal

```typescript

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



 //Editorjs tools 


 import Comment from "editorjs-comment";



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
      }: {
        commentBlockId: string;
        blockId: string;
        onClose: () => void;
        addCommentBlockData: (data: any) => void;
      }) => {
        return RenderItem({
          onClose,
          blockId,
           commentBlockId,
          addCommentBlockData
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


```


##### note: This  project is still in beta so changes will happen often 
## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/osain-az/editorjs-comment/issues).

## Show your support

Give a ⭐️ if this project helped you!