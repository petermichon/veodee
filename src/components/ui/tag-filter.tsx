import { memo } from 'react';
import { useTag } from '@/contexts/tag-context';

interface TagFilterProps {
  className?: string;
}

export const TagFilter = memo(function TagFilter({
  className = '',
}: TagFilterProps) {
  const { tags, selectedTags, setSelectedTags } = useTag();

  const handleTagToggle = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      setSelectedTags(selectedTags.filter((tag) => tag !== tagName));
    } else {
      setSelectedTags([...selectedTags, tagName]);
    }
  };

  const handleClearAll = () => {
    setSelectedTags([]);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Tag Pills */}
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag.name}
            onClick={() => handleTagToggle(tag.name)}
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              selectedTags.includes(tag.name) ? '' : 'hover:opacity-75'
            }`}
            style={{
              backgroundColor: selectedTags.includes(tag.name)
                ? tag.color
                : `${tag.color}20`,
              color: selectedTags.includes(tag.name) ? 'white' : tag.color,
            }}
          >
            {tag.name}
          </button>
        ))}

        <button
          onClick={handleClearAll}
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground transition-colors ${
            selectedTags.length === 0 ? 'invisible' : ''
          }`}
          disabled={selectedTags.length === 0}
        >
          Clear all
        </button>
      </div>
    </div>
  );
});
