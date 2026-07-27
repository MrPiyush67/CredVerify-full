import { useState } from 'react';
import { FileText, Calendar, Building2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const CATEGORY_STYLES = {
  skill: 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300',
  education: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300',
  technology: 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300',
};

export default function DigilockerDocumentSelector({
  documents,
  onImport,
  onClose,
  isLoading,
}) {
  const [selectedDocs, setSelectedDocs] = useState([]);

  const toggleDocument = (doc) => {
    setSelectedDocs((prev) => {
      const isSelected = prev.some((d) => d.uri === doc.uri);
      return isSelected
        ? prev.filter((d) => d.uri !== doc.uri)
        : [...prev, doc];
    });
  };

  const handleImport = () => {
    if (selectedDocs.length === 0) {
      toast.error('Please select at least one document');
      return;
    }
    onImport(selectedDocs);
  };

  const handleSelectAll = () => {
    setSelectedDocs(
      selectedDocs.length === documents.length ? [] : [...documents],
    );
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-5 border-b bg-primary/5">
          <DialogTitle>Select Documents to Import</DialogTitle>
          <DialogDescription>
            Choose documents from your DigiLocker account
          </DialogDescription>
        </DialogHeader>

        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-muted-foreground">
              <span className="font-semibold text-primary">
                {selectedDocs.length}
              </span>{' '}
              of <span className="font-semibold">{documents.length}</span>{' '}
              selected
            </div>
            <Button variant="outline" size="sm" onClick={handleSelectAll}>
              {selectedDocs.length === documents.length
                ? 'Deselect All'
                : 'Select All'}
            </Button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-2">
            {documents.map((doc) => {
              const isSelected = selectedDocs.some((d) => d.uri === doc.uri);

              return (
                <motion.div
                  key={doc.uri}
                  layout
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => toggleDocument(doc)}
                  className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-border hover:border-primary/50 hover:bg-accent/50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleDocument(doc)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1 shrink-0"
                    />

                    <div
                      className={`shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
                        isSelected ? 'bg-primary/15' : 'bg-muted'
                      }`}
                    >
                      <FileText
                        className={`w-6 h-6 ${
                          isSelected ? 'text-primary' : 'text-muted-foreground'
                        }`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base mb-2">
                        {doc.name || doc.doctype || 'Document'}
                      </h3>

                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        {doc.issuerName && (
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-4 h-4" />
                            <span>{doc.issuerName}</span>
                          </div>
                        )}
                        {doc.date && (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(doc.date).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                        )}
                        {doc.nsqfLevel && (
                          <Badge variant="secondary">
                            NSQF Level {doc.nsqfLevel}
                          </Badge>
                        )}
                        {doc.category && (
                          <Badge
                            className={
                              CATEGORY_STYLES[doc.category] ||
                              'bg-secondary text-secondary-foreground'
                            }
                          >
                            {doc.category.charAt(0).toUpperCase() +
                              doc.category.slice(1)}
                          </Badge>
                        )}
                      </div>

                      {doc.description && (
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                          {doc.description}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={selectedDocs.length === 0 || isLoading}
            className="min-w-[160px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              `Import ${selectedDocs.length} Document${
                selectedDocs.length !== 1 ? 's' : ''
              }`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
