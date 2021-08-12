type ActionProps = {
  contenu: string
  commentaire: string
}

const Action = ({ contenu, commentaire }: ActionProps) => {
  return(
  <div>
    <p>{contenu}</p>
    <p>{commentaire}</p>
  </div>
    )
};

export default Action;