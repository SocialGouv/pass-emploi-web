/**
 * Usage : 
 * 
 * const [content, setContent] = useState('');
 * const [comment, setComment] = useState('');
 * 
 * <ActionEditMode 
              content={content}
              comment={comment}
              onContentChange={(newContent: string) => setContent(newContent)}
              onCommentChange={(newComment: string) => setComment(newComment)}
        />
 */

import styles from 'styles/components/Action.module.css'

type ActionProps = {
  onContentChange: any
  onCommentChange: any
  content?: string
  comment?: string
  isDone?: boolean
}


const Action = ({onContentChange, onCommentChange, content = '', comment = '', isDone = false }: ActionProps) => {
  return(
  <div className={`text-bleu_nuit ${styles.container}`}>
    <input type="text" name="content" onChange={(event) => onContentChange(event.target.value)} value={content} required /> 
    <input type="text" name="comment" onChange={(event) => onCommentChange(event.target.value)} value={comment} /> 
  </div>
    )
};

export default Action;