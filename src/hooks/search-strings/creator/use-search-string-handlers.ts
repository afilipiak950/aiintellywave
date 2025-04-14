
import { SearchStringType, SearchStringSource } from '../search-string-types';

export const useSearchStringHandlers = ({
  setType,
  setInputSource,
  setInputText,
  setPreviewString,
  setInputUrl,
  setSelectedFile
}) => {
  const handleTypeChange = (value: SearchStringType) => {
    setType(value);
    setPreviewString(null);
  };

  const handleSourceChange = (value: SearchStringSource) => {
    setInputSource(value);
    setPreviewString(null);
    setInputText('');
    setInputUrl('');
    setSelectedFile(null);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputUrl(e.target.value);
  };

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
  };

  return {
    handleTypeChange,
    handleSourceChange,
    handleTextChange,
    handleUrlChange,
    handleFileSelect
  };
};
