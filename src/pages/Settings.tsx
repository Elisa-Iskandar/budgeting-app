import { useState } from 'react';
import { deleteAllData } from '../db/database';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function Settings() {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleDeleteAllData = async () => {
    setError('');
    setSuccess(false);
    setIsDeleting(true);

    try {
      await deleteAllData();
      setSuccess(true);
      setShowDeleteConfirmation(false);
      
      // reset success message after 2 seconds and reload
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError('Failed to delete data. Please try again.');
      console.error('Delete error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
    setError('');
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-10 bg-white">
      <h2 className="text-center text-2xl font-normal mb-10">Settings</h2>

      {/* danger zone */}
      <div className="border-2 border-red-500 rounded-lg p-8 bg-red-50">
        <Label className="text-base font-semibold text-red-600 mb-4 block">
          ⚠️ Danger Zone
        </Label>

        {!showDeleteConfirmation ? (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-6">
              Delete all your data including expenses, budgets, and categories. This action cannot be undone.
            </p>
            <Button 
              onClick={() => setShowDeleteConfirmation(true)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete All Data
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-lg p-6 border border-red-300">
            <h3 className="font-semibold text-red-600 mb-3">
              Are you sure you want to delete all data?
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              This action is permanent and cannot be reversed. All your expenses, budgets, and categories will be deleted.
            </p>

            {/* error / success */}
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            {success && <p className="text-green-500 text-sm mb-4">✓ Data deleted successfully. Reloading...</p>}

            {/* confirmation buttons */}
            <div className="flex items-center gap-4">
              <Button 
                onClick={handleDeleteAllData}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Everything'}
              </Button>
              <Button 
                onClick={handleCancelDelete}
                disabled={isDeleting}
                className="bg-gray-400 hover:bg-gray-500 text-white"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}