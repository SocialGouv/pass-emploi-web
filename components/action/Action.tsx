
import styles from 'styles/components/Action.module.css'

type ActionProps = {
  content: string
  comment: string
  editMode?: boolean
  onContentChange?: any
  onCommentChange?: any
}

function EditMode(content: string, comment: string, onContentChange: any, onCommentChange: any){

  return <span>
          <input type="text" name="content" onChange={(event) => onContentChange(event.target.value)} value={content} required /> 
          <input type="text" name="comment" onChange={(event) => onCommentChange(event.target.value)} value={comment} /> 
        </span>;
}

function NonEditMode(content: string, comment: string) {
  return <span>
          <p className='text-lg'>{content}</p>
          <p className='text-sm'>{comment}</p>
        </span>;
}


const Action = ({ content, comment, onContentChange, onCommentChange, editMode = false }: ActionProps) => {
  return(
  <div className={`text-blanc ${styles.container}`}>
    <input type="checkbox" className={styles.checkbox}/>
    {  editMode ?  EditMode(content, comment, onContentChange, onCommentChange) : NonEditMode(content, comment)}
  </div>
    )
};

export default Action;