
import { useState, useEffect } from 'react';
import { Save, X, Edit } from 'lucide-react';
import { Input } from "../../input";
import { Button } from "../../button";

interface EditableCellProps {
  value: any;
  isEditing: boolean;
  canEdit: boolean;
  onStartEditing: () => void;
  onSave: (value: string) => void;
  onCancel: () => void;
}

const EditableCell = ({
  value,
  isEditing,
  canEdit,
  onStartEditing,
  onSave,
  onCancel
}: EditableCellProps) => {
  const [editValue, setEditValue] = useState('');
  
  useEffect(() => {
    if (isEditing) {
      setEditValue(value?.toString() || '');
    }
  }, [isEditing, value]);
  
  if (isEditing) {
    return (
      <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="py-1 h-8"
          onClick={(e) => e.stopPropagation()}
        />
        <Button size="sm" variant="ghost" onClick={(e) => {
          e.stopPropagation();
          onSave(editValue);
        }}>
          <Save size={16} />
        </Button>
        <Button size="sm" variant="ghost" onClick={(e) => {
          e.stopPropagation();
          onCancel();
        }}>
          <X size={16} />
        </Button>
      </div>
    );
  }
  
  return (
    <div className={`${canEdit ? 'group relative' : ''} truncate max-w-xs`}>
      {value?.toString() || ''}
      {canEdit && (
        <Edit size={14} className="invisible group-hover:visible absolute top-1/2 right-0 transform -translate-y-1/2 text-gray-400" />
      )}
    </div>
  );
};

export default EditableCell;
