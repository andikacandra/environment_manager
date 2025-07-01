<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreGroupRequest;
use App\Http\Requests\UpdateGroupRequest;
use App\Models\GroupMember;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class GroupController extends Controller
{
    use AuthorizesRequests;
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $this->authorize(ability: 'view-any-groups');
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $isSuperAdmin = $user->roles->contains(function ($role) {
            return strtolower($role->name) === 'super-admin';
        });
        if ($isSuperAdmin) {
            $groups = Group::with(['groupMembers'])
                ->orderBy('name')
                ->get();
        } else {
            $userGroupIds = $user->groupMembers->pluck('group.id')->toArray();
            $groups = Group::with(['groupMembers'])
                ->whereIn('id', $userGroupIds)
                ->orderBy('name')
                ->get();
        }

        return Inertia::render('Dashboard/Groups/Index', [
            'groups' => $groups,
            'canCreateGroup' => $user->can('create-groups'),
            'canEditGroup' => $user->can('edit-groups'),
            'canDeleteGroup' => $user->can('delete-groups'),
            'isSuperAdmin' => $isSuperAdmin,
        ]);
    }
    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
        $this->authorize(ability: 'create-groups');
        return Inertia::render('Dashboard/Groups/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreGroupRequest $request)
    {
        //
        $validatedData = $request->validated();
        try {
            $group = Group::create([
                'name' => $validatedData['name'],
                'description' => $validatedData['description'],
                'slug' => Str::slug($validatedData['name']),
            ])->load([
                'groupMembers',
                'applications'
            ]);

            /** @var \App\Models\User $user */
            $user = Auth::user();

            $viewPermission = Permission::create(['name' => 'view-group-' . $group->slug]);
            $editPermission = Permission::create(['name' => 'edit-group-' . $group->slug]);
            $deletePermission = Permission::create(['name' => 'delete-group-' . $group->slug]);

            $createMembersPermission = Permission::create(['name' => 'create-groupMembers-' . $group->slug]);
            $editMembersPermission = Permission::create(['name' => 'edit-groupMembers-' . $group->slug]);
            $deleteMembersPermission = Permission::create(['name' => 'delete-groupMembers-' . $group->slug]);
            $createAppsPermission = Permission::create(['name' => 'create-applications-' . $group->slug]);

            $user->givePermissionTo([
                $viewPermission,
                $editPermission,
                $deletePermission,
                $createMembersPermission,
                $editMembersPermission,
                $deleteMembersPermission,
                $createAppsPermission,
            ]);

            GroupMember::create([
                'user_id' => $user->id,
                'group_id' => $group->id,
                'role' => 'admin',
            ]);

            return redirect()->route('groups.index')->with('success', 'Group created successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to create group: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Group $group)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user->can('view-groups') && !$user->can('view-group-' . $group->slug)) {
            $this->authorize('view-groups');
        }

        $group->load(
            'groupMembers',
            'groupMembers.user',
            'applications'
        );

        $isSuperAdmin = $user->roles->contains(function ($role) {
            return strtolower($role->name) === 'super-admin';
        });

        $isGroupAdmin = $group->groupMembers->contains(function ($member) use ($user) {
            return $member->user_id === $user->id && $member->role === 'admin';
        });

        $isAdmin = $isSuperAdmin || $isGroupAdmin;

        return Inertia::render('Dashboard/Groups/Show', [
            'group' => $group,
            'isAdmin' => $isAdmin,
            'canViewApplications' => $user->can('view-applications') || $user->can('view-applications-' . $group->slug),
            'canViewGroupMembers' => $user->can('view-groupMembers') || $user->can('view-groupMembers-' . $group->slug),
            'canCreateGroupMembers' => $user->can('create-groupMembers') || $user->can('create-groupMembers-' . $group->slug),
            'canEditGroupMembers' => $user->can('edit-groupMembers') || $user->can('edit-groupMembers-' . $group->slug),
            'canDeleteGroupMembers' => $user->can('delete-groupMembers') || $user->can('delete-groupMembers-' . $group->slug),
        ]);
    }
    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Group $group)
    {
        //
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user->can('edit-groups') && !$user->can('edit-group-' . $group->slug)) {
            $this->authorize('view-groups'); // This will throw the appropriate 403 exception
        }
        return Inertia::render('Dashboard/Groups/Edit', [
            'group' => $group,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateGroupRequest $request, Group $group)
    {
        //
        $validatedData = $request->validated();
        try {
            $group->update($validatedData);
            return redirect()->route('groups.index')->with('success', 'Group updated successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update group: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified group and clean up associated permissions.
     *
     * @param Group $group
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(Group $group)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        // Check if user has either global or group-specific delete permission
        if (!$user->can('delete-groups') && !$user->can('delete-group-' . $group->slug)) {
            $this->authorize('delete-group-' . $group->slug); // Throw the specific permission exception
        }

        try {
            DB::beginTransaction();
            $group->load('groupMembers.user');
            $groupPermissions = [
                'view-group-' . $group->slug,
                'edit-group-' . $group->slug,
                'delete-group-' . $group->slug,
                'create-groupMembers-' . $group->slug,
                'edit-groupMembers-' . $group->slug,
                'delete-groupMembers-' . $group->slug,
                'create-applications-' . $group->slug,
            ];
            foreach ($group->groupMembers as $member) {
                if ($member->user) {
                    $member->user->revokePermissionTo($groupPermissions);
                }
            }
            Permission::whereIn('name', $groupPermissions)->delete();
            $group->delete();

            DB::commit();

            return redirect()
                ->route('groups.index')
                ->with('success', 'Group deleted successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            report($e); // Log the error

            return redirect()
                ->back()
                ->with('error', 'Failed to delete group: ' . $e->getMessage());
        }
    }

    /**
     * Show form to add members to a group
     *
     * @param Group $group
     * @return \Inertia\Response | \Illuminate\Http\RedirectResponse
     */
    public function createGroupMembers(Group $group)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if (!$user->can('create-groupMembers') && !$user->can('create-groupMembers-' . $group->slug)) {
            $this->authorize('create-groupMembers-' . $group->slug);
        }
        try {
            $group->load('groupMembers.user');
            $existingMemberIds = $group->groupMembers->pluck('user_id')->toArray();
            $availableUsers = User::select(['id', 'email', 'full_name', 'created_at'])
                ->whereNotIn('id', $existingMemberIds)
                ->orderBy('full_name')
                ->get();

            return Inertia::render('Dashboard/Groups/GroupMembers/Create', [
                'group' => $group,
                'users' => $availableUsers,
                'canCreateGroupMembers' => true,
            ]);
        } catch (\Exception $e) {
            report($e); // Log the error
            return redirect()->route('groups.show', $group)->with('error', 'Error loading user data: ' . $e->getMessage());
        }
    }

    public function storeGroupMembers(Request $request, Group $group)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user->can('create-groupMembers') && !$user->can('create-groupMembers-' . $group->slug)) {
            $this->authorize('create-groupMembers-' . $group->slug);
        }

        $validatedData = $request->validate([
            'user_id' => 'required|exists:users,id',
            'role' => 'required|string|max:255|in:admin,member',
        ]);

        DB::beginTransaction();
        try {
            $groupMember = $group->groupMembers()->create([
                'user_id' => $validatedData['user_id'],
                'role' => $validatedData['role'],
            ]);

            $userMember = $groupMember->user;

            $applications = $group->applications;

            // Group level permissions
            if ($validatedData['role'] === 'admin') {
                $userMember->givePermissionTo([
                    'view-group-' . $group->slug,
                    'edit-group-' . $group->slug,
                    'delete-group-' . $group->slug,
                    'create-groupMembers-' . $group->slug,
                    'edit-groupMembers-' . $group->slug,
                    'delete-groupMembers-' . $group->slug,
                    'create-applications-' . $group->slug,
                ]);

                foreach ($applications as $application) {
                    $userMember->givePermissionTo([
                        'view-application-' . $application->slug,
                        'edit-application-' . $application->slug,
                        'delete-application-' . $application->slug,
                    ]);
                }
            } else {
                $userMember->givePermissionTo([
                    'view-group-' . $group->slug,
                ]);
                foreach ($applications as $application) {
                    $userMember->givePermissionTo([
                        'view-application-' . $application->slug,
                    ]);
                }
            }

            DB::commit();
            return redirect()->route('groups.show', $group)->with('success', 'Group member added successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to add group member', [
                'group_id' => $group->id,
                'user_id' => $validatedData['user_id'],
                'role' => $validatedData['role'],
                'error' => $e->getMessage(),
            ]);
            return redirect()->back()->with('error', 'Failed to add group member: ' . $e->getMessage());
        }
    }

    /**
     * Update a group member's role
     * 
     * @param Request $request
     * @param Group $group
     * @param GroupMember $groupMember
     */
    public function updateGroupMembers(Request $request, Group $group, GroupMember $groupMember)
    {
        /** @var \App\Models\User $authUser */
        $authUser = Auth::user();
        if (!$authUser->can('edit-groupMembers') && !$authUser->can('edit-groupMembers-' . $group->slug)) {
            $this->authorize('edit-groupMembers-' . $group->slug);
        }

        $validatedData = $request->validate([
            'role' => 'required|string|max:255|in:admin,member',
        ]);

        try {
            $user = $groupMember->user;
            if ($validatedData['role'] === 'admin' && $groupMember->role !== 'admin') {
                $user->givePermissionTo([
                    'edit-group-' . $group->slug,
                    'delete-group-' . $group->slug,
                    'create-groupMembers-' . $group->slug,
                    'edit-groupMembers-' . $group->slug,
                    'delete-groupMembers-' . $group->slug,
                    'create-applications-' . $group->slug,
                ]);
            } elseif ($validatedData['role'] !== 'admin' && $groupMember->role === 'admin') {
                $user->revokePermissionTo([
                    'edit-group-' . $group->slug,
                    'delete-group-' . $group->slug,
                    'create-groupMembers-' . $group->slug,
                    'edit-groupMembers-' . $group->slug,
                    'delete-groupMembers-' . $group->slug,
                    'create-applications-' . $group->slug,
                ]);
            }
            $groupMember->role = $validatedData['role'];

            $groupMember->save();

            return redirect()
                ->back()
                ->with('success', 'Group member updated successfully!');
        } catch (\Exception $e) {
            Log::error('Failed to update group member', [
                'group_id' => $group->id,
                'group_member_id' => $groupMember->id,
                'role' => $validatedData['role'],
                'error' => $e->getMessage(),
            ]);
            return redirect()
                ->back()
                ->with('error', 'Failed to update group member: ' . $e->getMessage());
        }
    }

    public function destroyGroupMembers(Group $group, GroupMember $groupMember)
    {
        $this->authorize(ability: 'delete-groupMembers');

        try {
            if ($groupMember->role === 'admin') {
                $user = $groupMember->user;
                $user->revokePermissionTo([
                    'view-group-' . $group->slug,
                    'edit-group-' . $group->slug,
                    'delete-group-' . $group->slug,
                    'create-groupMembers-' . $group->slug,
                    'edit-groupMembers-' . $group->slug,
                    'delete-groupMembers-' . $group->slug,
                    'create-applications-' . $group->slug,
                ]);
            } else {
                $user = $groupMember->user;
                $user->revokePermissionTo([
                    'view-group-' . $group->slug,
                ]);
            }
            $groupMember->delete();

            return redirect()->route('groups.show', $group)->with('success', 'Group member removed successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to remove group member: ' . $e->getMessage());
        }
    }
}
