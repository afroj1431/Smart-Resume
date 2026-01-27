import { Link } from 'react-router-dom';

const EmptyState = ({ 
  icon = '📋', 
  title, 
  description, 
  actionLabel, 
  actionLink,
  size = 'default' 
}) => {
  const iconSize = size === 'large' ? 'text-6xl' : 'text-4xl';
  const titleSize = size === 'large' ? 'text-xl' : 'text-lg';
  
  return (
    <div className="text-center py-12 px-4">
      <div className={`${iconSize} mb-4 opacity-50`}>{icon}</div>
      <h3 className={`${titleSize} font-semibold text-gray-900 mb-2`}>{title}</h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">{description}</p>
      {actionLink && actionLabel && (
        <Link
          to={actionLink}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
};

export default EmptyState;

