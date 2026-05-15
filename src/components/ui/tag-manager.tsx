import { useState } from 'react';
import { useTag } from '@/contexts/tag-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export function TagManager() {
  const { tags, addTag, removeTag } = useTag();
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3b82f6');

  const predefinedColors = [
    '#ef4444', // red
    '#f97316', // orange
    '#f59e0b', // amber
    '#84cc16', // lime
    '#10b981', // emerald
    '#06b6d4', // cyan
    '#3b82f6', // blue
    '#8b5cf6', // violet
    '#ec4899', // pink
  ];

  const handleAddTag = () => {
    if (newTagName.trim()) {
      // Check if tag already exists
      if (
        tags.some(
          (tag) => tag.name.toLowerCase() === newTagName.trim().toLowerCase()
        )
      ) {
        alert('A tag with this name already exists');
        return;
      }

      addTag({
        name: newTagName.trim(),
        color: newTagColor,
      });
      setNewTagName('');
      setNewTagColor('#3b82f6');
    }
  };

  const handleRemoveTag = (tagName: string) => {
    if (
      confirm(
        `Are you sure you want to remove the "${tagName}" tag? This will also remove it from all videos.`
      )
    ) {
      removeTag(tagName);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTag();
    }
  };

  return (
    <div className="space-y-4">
      {/* Add New Tag Form */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Manage Tags</h3>

        <div className="flex gap-2">
          <Input
            placeholder="New tag name..."
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />

          <div className="flex gap-1">
            {predefinedColors.map((color) => (
              <button
                key={color}
                onClick={() => setNewTagColor(color)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  newTagColor === color
                    ? 'border-foreground scale-110'
                    : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          <Button onClick={handleAddTag} disabled={!newTagName.trim()}>
            Add Tag
          </Button>
        </div>
      </div>

      {/* Existing Tags */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">
          Existing Tags ({tags.length})
        </h4>

        {tags.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            No tags created yet
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge
                key={tag.name}
                className="group relative pr-8"
                style={{
                  backgroundColor: `${tag.color}20`,
                  color: tag.color,
                  borderColor: tag.color,
                }}
              >
                {tag.name}
                <button
                  onClick={() => handleRemoveTag(tag.name)}
                  className="absolute -right-1 -top-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs hover:bg-destructive/80"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
