package com.nexusapps.atlas.ui.components

import android.content.Context
import android.util.AttributeSet
import android.view.LayoutInflater
import android.view.View
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.content.ContextCompat
import com.google.android.material.navigation.NavigationView
import com.nexusapps.atlas.R

class ModernNavigationView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : NavigationView(context, attrs, defStyleAttr) {

    private var selectedItemId: Int = -1

    override fun onFinishInflate() {
        super.onFinishInflate()
        setupModernStyling()
    }

    private fun setupModernStyling() {
        // Set modern background
        setBackgroundColor(ContextCompat.getColor(context, R.color.white))
        
        // Set elevation for modern look
        elevation = 8f
    }

    fun setSelectedItem(itemId: Int) {
        selectedItemId = itemId
        updateItemStyles()
    }

    private fun updateItemStyles() {
        // This would be implemented to update the visual state of menu items
        // For now, the styling is handled through the custom menu item layout
    }

    fun getSelectedItemId(): Int = selectedItemId
}
