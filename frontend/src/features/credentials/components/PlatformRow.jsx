import { CheckCircle, Trash2, RefreshCw, Loader2 } from 'lucide-react';
import { Input, Button } from '@common';

export default function PlatformRow({
  platform,
  platformData,
  inputValue,
  isSubmitting,
  isRefreshing,
  onInputChange,
  onSubmit,
  onDelete,
  onRefresh,
  onVerify,
}) {
  const isSubmitted = platformData?.handle;
  const isVerified = platformData?.isVerified;
  const isPendingValidation = platformData?.pendingValidation && !platformData?.isVerified;
  const stats = platformData?.stats;

  return (
    <div className="flex px-6 items-center gap-3 py-3 border-b last:border-b-0">
      <div className="flex items-center gap-3 w-56 shrink-0">
        {platform.domain ? (
          <img
            src={`https://www.google.com/s2/favicons?domain=${platform.domain}&sz=128`}
            alt={`${platform.name} icon`}
            className="h-6 w-6"
          />
        ) : (
          <span className="text-sm font-medium">{platform.icon}</span>
        )}
        <span className="text-sm font-medium">{platform.name}</span>
      </div>

      <div className="flex-1 flex items-center gap-2">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground truncate max-w-[60%]">
            {platform.baseProfileUrl}
          </span>
          <Input
            type="text"
            placeholder={platform.placeholder || 'johndoe'}
            value={inputValue}
            onChange={(e) => onInputChange(platform.id, e.target.value)}
            disabled={isSubmitted}
            className="pl-[calc(60%+0.5rem)] text-sm"
          />
        </div>

        {isSubmitted ? (
          <div className="flex items-center gap-2">
            {isPendingValidation ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1 bg-yellow-50 rounded-full border border-yellow-200">
                  <Loader2 className="h-4 w-4 text-yellow-600 animate-spin" />
                  <span className="text-xs font-medium text-yellow-700">Pending Regulator Approval</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => onDelete(platform.id, platform.name)}
                  className="rounded-full px-3"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            ) : isVerified ? (
              <>
                {stats && (
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => onRefresh(platform.id)}
                    disabled={isRefreshing}
                    className="rounded-full px-4 gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                )}
                <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full border border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-xs font-medium text-green-700">Verified</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => onDelete(platform.id, platform.name)}
                  className="rounded-full px-3"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  type="button"
                  onClick={() => onVerify(platform.id, platformData.handle, platform.name)}
                  className="rounded-full px-4 bg-[#116466] text-white hover:bg-[#0e4f50]"
                >
                  Verify
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => onDelete(platform.id, platform.name)}
                  className="rounded-full px-3"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        ) : (
          <Button
            size="sm"
            type="button"
            onClick={() => onSubmit(platform)}
            disabled={!inputValue.trim() || isSubmitting}
            className="rounded-full px-4 bg-[#116466] text-white hover:bg-[#0e4f50]"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        )}
      </div>
    </div>
  );
}
