import { Navigate, useParams } from 'react-router-dom';

/**
 * Redirect component for proposal creation route
 * Redirects to the expert job details page when creating a proposal
 */
const ProposalCreateRouteRedirect = () => {
  const { jobId } = useParams();
  return <Navigate to={`/expert/jobs/${jobId ?? ''}`} replace />;
};

export default ProposalCreateRouteRedirect;