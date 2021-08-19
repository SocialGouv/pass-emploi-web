import classNames from 'classnames';
import { UserAction } from 'interfaces'

import styles from 'styles/components/Action.module.css'


type ActionProps = {
  action: UserAction,
  toggleStatus?: any,
}

const Action = ( {action, toggleStatus}: ActionProps) => {

  const handleCheckChange = () => {
    toggleStatus(action)
  };

  var containerStyles = classNames(styles.container, action.isDone ? styles.isDone : '');

  return(
  <div className={containerStyles}>
    <input type="checkbox" id={action.id} onChange={handleCheckChange} defaultChecked={action.isDone} aria-checked={action.isDone}/>
    <label htmlFor={action.id} ><span></span>
    <div>
      <p className='text-lg'>{action.content}</p>
      <p className='text-sm'>{action.comment}</p>
    </div>
      
    </label>
    
  </div>
    )
};

export default Action;