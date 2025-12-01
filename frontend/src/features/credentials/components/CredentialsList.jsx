import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@common';
import CredentialsGridView from './CredentialsGridView';
import { useDispatch } from 'react-redux';
import { removeCredential, editCredential } from '../redux/credentialsSlice';

export default function CredentialsList({ credentials, onViewDetails, pagination, onPageChange }) {
  const dispatch = useDispatch();

  const handleTogglePublic = async (credential) => {
    try {
      await dispatch(editCredential({
        id: credential._id,
        data: { isPublic: !credential.isPublic }
      })).unwrap();
    } catch (error) {
      console.error('Failed to toggle public status:', error);
    }
  };

  const handleDelete = async (credential) => {
    if (window.confirm(`Are you sure you want to delete "${credential.title}"?`)) {
      try {
        await dispatch(removeCredential(credential._id)).unwrap();
      } catch (error) {
        console.error('Failed to delete credential:', error);
      }
    }
  };

  const handleDownload = (credential) => {
    if (credential.file?.url) {
      window.open(credential.file.url, '_blank');
    }
  };

  return (
    <>
      <CredentialsGridView
        credentials={credentials}
        onViewDetails={onViewDetails}
        onTogglePublic={handleTogglePublic}
        onDelete={handleDelete}
        onDownload={handleDownload}
      />

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </>
  );
}
