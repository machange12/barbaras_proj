import { useEffect } from 'react';

export function useDocumentTitle(title: string, description?: string) {
  useEffect(() => {
    document.title = title;

    if (!description) {
      return;
    }

    let tag = document.querySelector('meta[name="description"]');

    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('name', 'description');
      document.head.appendChild(tag);
    }

    tag.setAttribute('content', description);
  }, [title, description]);
}
