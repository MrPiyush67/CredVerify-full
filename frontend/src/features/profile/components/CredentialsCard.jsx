import { useState } from 'react';
import { Award, Plus, Edit2, Eye, FileText, Globe, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@common';

export function CredentialsCard({ credentials = [], isOwnProfile = false, className = "" }) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  const handleViewAll = () => {
    navigate('/credentials');
  };

  const handleAddCredential = () => {
    navigate('/credentials');
  };

  const displayCredentials = credentials.slice(0, 3);

  return (
    <div className={`bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden col-span-1 md:col-span-4 ${className}`}>
      {/* Header */}
      <div className="px-6 pt-6 pb-2 flex items-center justify-between mb-2 border-b border-gray-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-50 rounded-lg">
            <Award className="h-[18px] w-[18px] text-teal-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">Credentials</h3>
            <p className="text-xs text-gray-500">
              {credentials.length} {credentials.length === 1 ? 'credential' : 'credentials'}
            </p>
          </div>
        </div>
        
        {isOwnProfile && (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title={isEditing ? 'Done' : 'Edit'}
          >
            <Edit2 className={`h-4 w-4 ${isEditing ? 'text-teal-600' : 'text-gray-500'}`} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        {credentials.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Award className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm mb-4">No credentials yet</p>
          {isOwnProfile && (
            <Button
              onClick={handleAddCredential}
              size="sm"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Credential
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {displayCredentials.map((credential, index) => (
            <div
              key={credential._id || index}
              className="group/item relative flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-all duration-200 cursor-pointer border border-transparent hover:border-gray-200"
              onClick={() => navigate('/credentials')}
            >
              {/* Thumbnail */}
              <div className="shrink-0 w-16 h-16 rounded-lg overflow-hidden shadow-sm bg-linear-to-br from-teal-50 to-green-50">
                {credential.file?.url ? (
                  credential.file.fileType?.includes('image') ? (
                    <>
                      <img
                        src={credential.file.url}
                        alt={credential.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.nextElementSibling.style.display = 'flex';
                        }}
                      />
                      <div className="w-full h-full flex items-center justify-center bg-teal-600 text-white" style={{ display: 'none' }}>
                        <FileText className="h-8 w-8" />
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileText className="h-8 w-8 text-teal-600" />
                    </div>
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileText className="h-8 w-8 text-teal-600" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-medium text-sm text-gray-900 line-clamp-1 group-hover/item:text-teal-600 transition-colors">
                    {credential.title}
                  </h4>
                  <div className="shrink-0">
                    {credential.isPublic ? (
                      <Globe className="h-3.5 w-3.5 text-teal-600" title="Public" />
                    ) : (
                      <Lock className="h-3.5 w-3.5 text-gray-400" title="Private" />
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-600 line-clamp-1 mt-0.5">
                  {credential.issuer || 'No issuer'}
                </p>
                {credential.type && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                    {credential.type.replace('_', ' ')}
                  </span>
                )}
              </div>

              {/* Edit mode actions */}
              {isEditing && isOwnProfile && (
                <div className="absolute top-2 right-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/credentials');
                    }}
                    className="p-1.5 bg-white rounded shadow-sm hover:bg-teal-50 border border-gray-200"
                    title="Edit credential"
                  >
                    <Edit2 className="h-3.5 w-3.5 text-teal-600" />
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* View All Button */}
          <div className="pt-2">
            <Button
              onClick={handleViewAll}
              variant="outline"
              size="sm"
              className="w-full gap-2 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300"
            >
              <Eye className="h-4 w-4" />
              {credentials.length > 3 ? `View All (${credentials.length})` : 'View All'}
            </Button>
          </div>

          {/* Add New Button */}
          {isOwnProfile && (
            <Button
              onClick={handleAddCredential}
              size="sm"
              className="w-full gap-2 mt-2"
            >
              <Plus className="h-4 w-4" />
              Add New Credential
            </Button>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
