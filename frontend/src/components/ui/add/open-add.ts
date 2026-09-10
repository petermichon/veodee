import { useLocation } from 'react-router-dom';

export function openAddDialog() {
  window.dispatchEvent(new CustomEvent('open-add-dialog'));
}

const ADD_ROUTES = ['/', '/following'];

export function useShowAdd() {
  const location = useLocation();
  return ADD_ROUTES.includes(location.pathname);
}
