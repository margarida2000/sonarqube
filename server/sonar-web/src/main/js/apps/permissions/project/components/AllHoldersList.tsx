/*
 * SonarQube
 * Copyright (C) 2009-2022 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
import { without } from 'lodash';
import * as React from 'react';
import ListFooter from '../../../../components/controls/ListFooter';
import { Component, Paging, PermissionGroup, PermissionUser } from '../../../../types/types';
import HoldersList from '../../shared/components/HoldersList';
import SearchForm from '../../shared/components/SearchForm';
import { convertToPermissionDefinitions, PERMISSIONS_ORDER_BY_QUALIFIER } from '../../utils';

interface Props {
  component: Component;
  filter: string;
  grantPermissionToGroup: (group: string, permission: string) => Promise<void>;
  grantPermissionToUser: (user: string, permission: string) => Promise<void>;
  groups: PermissionGroup[];
  groupsPaging?: Paging;
  onLoadMore: () => void;
  onFilterChange: (filter: string) => void;
  onPermissionSelect: (permissions?: string) => void;
  onQueryChange: (query: string) => void;
  query: string;
  revokePermissionFromGroup: (group: string, permission: string) => Promise<void>;
  revokePermissionFromUser: (user: string, permission: string) => Promise<void>;
  selectedPermission?: string;
  users: PermissionUser[];
  usersPaging?: Paging;
}

export default class AllHoldersList extends React.PureComponent<Props> {
  handleToggleUser = (user: PermissionUser, permission: string) => {
    const hasPermission = user.permissions.includes(permission);

    if (hasPermission) {
      return this.props.revokePermissionFromUser(user.login, permission);
    } else {
      return this.props.grantPermissionToUser(user.login, permission);
    }
  };

  handleToggleGroup = (group: PermissionGroup, permission: string) => {
    const hasPermission = group.permissions.includes(permission);

    if (hasPermission) {
      return this.props.revokePermissionFromGroup(group.name, permission);
    } else {
      return this.props.grantPermissionToGroup(group.name, permission);
    }
  };

  handleSelectPermission = (permission?: string) => {
    this.props.onPermissionSelect(permission);
  };

  render() {
    const {
      component: { qualifier, visibility },
      filter,
      groups,
      groupsPaging,
      users,
      usersPaging,
    } = this.props;
    let order = PERMISSIONS_ORDER_BY_QUALIFIER[qualifier];
    if (visibility === 'public') {
      order = without(order, 'user', 'codeviewer');
    }
    const permissions = convertToPermissionDefinitions(order, 'projects_role');

    let count = 0;
    let total = 0;
    if (filter !== 'users') {
      count += groups.length;
      total += groupsPaging ? groupsPaging.total : groups.length;
    }
    if (filter !== 'groups') {
      count += users.length;
      total += usersPaging ? usersPaging.total : users.length;
    }

    return (
      <>
        <HoldersList
          filter={this.props.filter}
          groups={this.props.groups}
          isComponentPrivate={visibility !== 'public'}
          onSelectPermission={this.handleSelectPermission}
          onToggleGroup={this.handleToggleGroup}
          onToggleUser={this.handleToggleUser}
          permissions={permissions}
          query={this.props.query}
          selectedPermission={this.props.selectedPermission}
          users={this.props.users}
        >
          <SearchForm
            filter={this.props.filter}
            onFilter={this.props.onFilterChange}
            onSearch={this.props.onQueryChange}
            query={this.props.query}
          />
        </HoldersList>
        <ListFooter count={count} loadMore={this.props.onLoadMore} total={total} />
      </>
    );
  }
}
