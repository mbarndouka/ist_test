import React from 'react';
import { FileText } from 'lucide-react';
import { PurchaseRequest } from '../../types';
import { RequestCardLight as RequestCard  } from './RequestCard.variants';

interface RequestListProps {
  requests: PurchaseRequest[];
  onRefresh: () => void;
  onViewDetails: (req: PurchaseRequest) => void;
}

const RequestList: React.FC<RequestListProps> = ({ requests, onRefresh, onViewDetails }) => {
  if (requests.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
             <FileText className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">No requests found</h3>
        <p className="text-gray-500 mt-1 max-w-xs mx-auto">Get started by creating a new purchase request above.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {requests.map((req) => (
        <RequestCard
          key={req.id}
          request={req}
          onClick={() => onViewDetails(req)}
          onRefresh={onRefresh}
        />
      ))}
    </div>
  );
};

export default RequestList;