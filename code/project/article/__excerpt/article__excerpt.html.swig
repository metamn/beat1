<aside class="article__excerpt">
  <h3>Excerpt</h3>

  {% if (article.display.indexOf('excerpt_quote') !== -1) %}
    <blockquote class="blockquote">
      {{ article.excerpt | safe }}
    </blockquote>
  {% else %}
    <div class="text">
      {{ article.excerpt | safe }}
    </div>
  {% endif %}
</aside>
