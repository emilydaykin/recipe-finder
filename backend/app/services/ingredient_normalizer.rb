#
class IngredientNormalizer
  # This service normalizes ingredient names by:
  # 1. Removing leading quantity: "1", "1 ½", "¼", "3.5", etc.
  # 2. Removing unit words at the start
  # 3. Removing duplicate words
  # 4. Stripping whitespace
  # 5. Singularizing each word (so "radishes, trimmed" → "radish trimmed")
  # For this prototype, adjectives ('large', 'ripe') and qualifiers ('for dusting', 'for brushing, or to taste') are not removed.

  UNITS = %w[
    cup cups teaspoon teaspoons tablespoon tablespoons
    ounce ounces pound pounds pint pints quart quarts
    gram grams kilogram kilograms ml liter liters
    clove cloves can cans package packages bunch
    sprig sprigs
  ].freeze

  def self.call(raw)
    name = raw.to_s.downcase.strip

    name = name.gsub(/\A[\d\s\/\.½¼¾⅓⅔⅛⅜⅝⅞]+/, "")

    UNITS.each do |unit|
      name = name.sub(/\A#{unit}\b/, "")
    end

    words = name.split(/\s+/)
    words = words.chunk { |w| w }.map(&:first)
    words
      .map { |word| word.gsub(/[^a-z0-9'-]/, "") }
      .reject(&:blank?)
      .map(&:singularize)
      .join(" ")
      .strip
  end
end
